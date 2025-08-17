import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const joinSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  seasonId: z.string(),
  clubId: z.string(),
  token: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = joinSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { name, email, phone, seasonId, clubId, token } = validation.data

    // Verify magic invite is valid
    const magicInvite = await db.magicInvite.findUnique({
      where: { token },
      include: {
        season: true
      }
    })

    if (!magicInvite) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      )
    }

    // Check if invite is expired
    if (new Date(magicInvite.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Check if season and club match
    if (magicInvite.seasonId !== seasonId || magicInvite.clubId !== clubId) {
      return NextResponse.json(
        { error: 'Invalid invitation data' },
        { status: 400 }
      )
    }

    // Check if player already exists in this club
    const existingPlayer = await db.player.findUnique({
      where: {
        clubId_email: {
          clubId,
          email
        }
      }
    })

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'A player with this email already exists in this club' },
        { status: 400 }
      )
    }

    // Create player
    const player = await db.player.create({
      data: {
        name,
        email,
        phone,
        clubId,
      }
    })

    // Add player to season based on type
    if (magicInvite.season.type === 'LADDER') {
      // Check if ladder exists for this season
      let ladder = await db.ladder.findUnique({
        where: { seasonId }
      })

      if (!ladder) {
        ladder = await db.ladder.create({
          data: {
            seasonId,
            algorithm: 'ELO'
          }
        })
      }

      // Add to ladder with default rating
      await db.ladderPlayer.create({
        data: {
          ladderId: ladder.id,
          playerId: player.id,
          rating: 1200.0
        }
      })
    }
    // For BOX leagues, players will be assigned to boxes separately by admins

    return NextResponse.json({
      success: true,
      playerId: player.id,
      message: 'Successfully joined the season!'
    }, { status: 201 })

  } catch (error) {
    console.error('Join error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
