import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CreateMatchSchema, MatchFilterSchema } from '@/lib/validations/match';
import { auth } from '@/lib/auth-temp';

/**
 * GET /api/matches - List matches with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filterParams = {
      seasonId: searchParams.get('seasonId') || undefined,
      playerId: searchParams.get('playerId') || undefined,
      status: searchParams.get('status') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const validatedParams = MatchFilterSchema.parse(filterParams);

    // Build where clause
    const where: Prisma.MatchWhereInput = {};
    
    if (validatedParams.seasonId) {
      where.seasonId = validatedParams.seasonId;
    }
    
    if (validatedParams.playerId) {
      where.OR = [
        { playerAId: validatedParams.playerId },
        { playerBId: validatedParams.playerId }
      ];
    }
    
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }
    
    if (validatedParams.from || validatedParams.to) {
      where.scheduledAt = {};
      if (validatedParams.from) {
        where.scheduledAt.gte = new Date(validatedParams.from);
      }
      if (validatedParams.to) {
        where.scheduledAt.lte = new Date(validatedParams.to);
      }
    }

    // Fetch matches with related data
    const matches = await prisma.match.findMany({
      where,
      include: {
        playerA: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true
          }
        },
        playerB: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true
          }
        },
        season: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { scheduledAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: validatedParams.limit,
      skip: validatedParams.offset
    });

    // Get total count for pagination
    const total = await prisma.match.count({ where });

    return NextResponse.json({
      matches,
      pagination: {
        total,
        offset: validatedParams.offset,
        limit: validatedParams.limit,
        hasMore: validatedParams.offset + validatedParams.limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/matches - Create a new match
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateMatchSchema.parse(body);

    // Check if user has permission to create matches in this season
    const season = await prisma.season.findFirst({
      where: {
        id: validatedData.seasonId,
        club: {
          clubAdmins: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!season) {
      return NextResponse.json(
        { error: 'Season not found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify both players exist and are in the season
    const players = await prisma.player.findMany({
      where: {
        id: { in: [validatedData.playerAId, validatedData.playerBId] },
        club: {
          seasons: {
            some: {
              id: validatedData.seasonId
            }
          }
        }
      }
    });

    if (players.length !== 2) {
      return NextResponse.json(
        { error: 'One or both players not found in this season' },
        { status: 400 }
      );
    }

    // Check for existing pending match between these players
    const existingMatch = await prisma.match.findFirst({
      where: {
        seasonId: validatedData.seasonId,
        status: 'PENDING',
        OR: [
          {
            playerAId: validatedData.playerAId,
            playerBId: validatedData.playerBId
          },
          {
            playerAId: validatedData.playerBId,
            playerBId: validatedData.playerAId
          }
        ]
      }
    });

    if (existingMatch) {
      return NextResponse.json(
        { error: 'A pending match already exists between these players' },
        { status: 400 }
      );
    }

    // Create the match
    const match = await prisma.match.create({
      data: {
        seasonId: validatedData.seasonId,
        playerAId: validatedData.playerAId,
        playerBId: validatedData.playerBId,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        status: 'PENDING'
      },
      include: {
        playerA: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true
          }
        },
        playerB: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true
          }
        },
        season: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(match, { status: 201 });

  } catch (error) {
    console.error('Error creating match:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
