import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-temp'
import { db } from '@/lib/db'
import { clubSchema } from '@/lib/validation/schemas'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.role || !['ADMIN', 'CLUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let clubs
    if (session.user.role === 'ADMIN') {
      // Super admin can see all clubs
      clubs = await db.club.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              seasons: true,
              players: true,
            }
          }
        }
      })
    } else {
      // Club admin can only see their club
      clubs = await db.club.findMany({
        where: {
          clubAdmins: {
            some: {
              id: session.user.id
            }
          }
        },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              seasons: true,
              players: true,
            }
          }
        }
      })
    }

    return NextResponse.json(clubs)
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.role || !['ADMIN', 'CLUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = clubSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, slug, country, logoUrl } = validation.data

    // Check if slug already exists
    const existingClub = await db.club.findUnique({
      where: { slug }
    })
    
    if (existingClub) {
      return NextResponse.json(
        { error: 'A club with this URL slug already exists' },
        { status: 400 }
      )
    }

    // Create club
    const club = await db.club.create({
      data: {
        name,
        slug,
        country,
        logoUrl,
        ...(session.user.role === 'CLUB_ADMIN' && {
          clubAdmins: {
            connect: { id: session.user.id }
          }
        })
      },
      include: {
        _count: {
          select: {
            seasons: true,
            players: true,
          }
        }
      }
    })

    return NextResponse.json(club, { status: 201 })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
