import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-temp'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.role || !['ADMIN', 'CLUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let seasons
    if (session.user.role === 'ADMIN') {
      // Super admin can see all seasons
      seasons = await db.season.findMany({
        orderBy: { startDate: 'desc' },
        include: {
          club: {
            select: {
              name: true,
            }
          }
        }
      })
    } else {
      // Club admin can only see their club's seasons
      seasons = await db.season.findMany({
        where: {
          club: {
            clubAdmins: {
              some: {
                id: session.user.id
              }
            }
          }
        },
        orderBy: { startDate: 'desc' },
        include: {
          club: {
            select: {
              name: true,
            }
          }
        }
      })
    }

    return NextResponse.json(seasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}
