import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-temp'
import { db } from '@/lib/db'
import { z } from 'zod'

const csvRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  rating: z.string().optional().transform(val => {
    if (!val || val === '') return undefined
    const num = parseFloat(val)
    if (isNaN(num)) return undefined
    return Math.max(0, Math.min(3000, num))
  })
})

function parseCSV(csvText: string) {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row')
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = lines.slice(1)

  // Validate required headers
  if (!headers.includes('name') || !headers.includes('email')) {
    throw new Error('CSV must include "name" and "email" columns')
  }

  const players = rows.map((row, index) => {
    const values = row.split(',').map(v => v.trim())
    const playerData: Record<string, string> = {}
    
    headers.forEach((header, headerIndex) => {
      playerData[header] = values[headerIndex] || ''
    })

    try {
      return csvRowSchema.parse(playerData)
    } catch (error) {
      throw new Error(`Row ${index + 2}: Invalid data - ${error instanceof z.ZodError ? error.issues[0].message : 'Unknown error'}`)
    }
  })

  return players
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.role || !['ADMIN', 'CLUB_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const seasonId = formData.get('seasonId') as string

    if (!file || !seasonId) {
      return NextResponse.json(
        { error: 'File and season ID are required' },
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

    // Parse CSV file
    const csvText = await file.text()
    let players
    
    try {
      players = parseCSV(csvText)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to parse CSV' },
        { status: 400 }
      )
    }

    // Import players
    let imported = 0
    const errors: string[] = []

    for (const playerData of players) {
      try {
        // Check if player already exists in this club
        const existingPlayer = await db.player.findUnique({
          where: {
            clubId_email: {
              clubId: season.clubId,
              email: playerData.email
            }
          }
        })

        if (existingPlayer) {
          errors.push(`Player ${playerData.email} already exists in this club`)
          continue
        }

        // Create player
        const player = await db.player.create({
          data: {
            name: playerData.name,
            email: playerData.email,
            phone: playerData.phone,
            rating: playerData.rating,
            clubId: season.clubId,
          }
        })

        // Add player to season based on type
        if (season.type === 'LADDER') {
          // Check if ladder exists for this season
          let ladder = await db.ladder.findUnique({
            where: { seasonId: season.id }
          })

          if (!ladder) {
            ladder = await db.ladder.create({
              data: {
                seasonId: season.id,
                algorithm: 'ELO'
              }
            })
          }

          // Add to ladder
          await db.ladderPlayer.create({
            data: {
              ladderId: ladder.id,
              playerId: player.id,
              rating: playerData.rating || 1200.0
            }
          })
        }
        // For BOX leagues, players will be assigned to boxes separately

        imported++
      } catch (error) {
        errors.push(`Failed to import ${playerData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      imported,
      total: players.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    )
  }
}
