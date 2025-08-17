import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-temp'
import { db } from '@/lib/db'
import { clubSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Must be authenticated to create a club' },
        { status: 401 }
      )
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

    // Start a transaction to create user with CLUB_ADMIN role and club
    const result = await db.$transaction(async (tx) => {
      // First, update the user's role to CLUB_ADMIN
      const updatedUser = await tx.user.update({
        where: { email: session.user.email },
        data: { role: 'CLUB_ADMIN' }
      })

      // Create the club
      const club = await tx.club.create({
        data: {
          name,
          slug,
          country,
          logoUrl,
        }
      })

      // Create the ClubAdmin relationship
      await tx.clubAdmin.create({
        data: {
          userId: updatedUser.id,
          clubId: club.id
        }
      })

      return { user: updatedUser, club }
    })

    return NextResponse.json({
      success: true,
      club: result.club,
      message: 'Club created successfully! You are now a club administrator.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating club admin:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
