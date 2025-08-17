import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-temp'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.role || !['ADMIN', 'CLUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let invites
    if (session.user.role === 'ADMIN') {
      invites = await db.magicInvite.findMany({
        include: {
          season: {
            include: {
              club: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    } else {
      invites = await db.magicInvite.findMany({
        where: {
          season: {
            club: {
              clubAdmins: {
                some: {
                  id: session.user.id
                }
              }
            }
          }
        },
        include: {
          season: {
            include: {
              club: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    }

    return NextResponse.json(invites)
  } catch (error) {
    console.error('Error fetching magic invites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magic invites' },
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
    const { seasonId, expiryDays } = body

    if (!seasonId || !expiryDays) {
      return NextResponse.json(
        { error: 'Season ID and expiry days are required' },
        { status: 400 }
      )
    }

    // Validate season exists and user has access
    const season = await db.season.findUnique({
      where: { id: seasonId },
      include: {
        club: {
          include: {
            clubAdmins: true
          }
        }
      }
    })

    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this season's club
    if (session.user.role === 'CLUB_ADMIN') {
      const hasAccess = season.club.clubAdmins.some(admin => admin.id === session.user.id)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied to this club' },
          { status: 403 }
        )
      }
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex')
    
    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays))

    // Create magic invite
    const magicInvite = await db.magicInvite.create({
      data: {
        token,
        seasonId,
        clubId: season.clubId,
        expiresAt,
      }
    })

    return NextResponse.json(magicInvite, { status: 201 })
  } catch (error) {
    console.error('Error creating magic invite:', error)
    return NextResponse.json(
      { error: 'Failed to create magic invite' },
      { status: 500 }
    )
  }
}
