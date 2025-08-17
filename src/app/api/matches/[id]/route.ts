import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-temp';

/**
 * GET /api/matches/[id] - Get match details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const matchId = id;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
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
            name: true,
            sport: true,
            type: true,
            club: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        result: {
          include: {
            winner: {
              select: {
                id: true,
                name: true
              }
            },
            reportedByPlayer: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json(match);

  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/matches/[id] - Cancel/delete a match
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const matchId = id;

    // Get the match with season info for permission check
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        season: {
          include: {
            club: {
              include: {
                clubAdmins: true
              }
            }
          }
        },
        result: true
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if match already has a result
    if (match.result) {
      return NextResponse.json(
        { error: 'Cannot delete a match with a result' },
        { status: 400 }
      );
    }

    // Check if user has permission to delete match
    const isAdmin = match.season.club.clubAdmins.some(admin => admin.userId === session.user.id);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only club admins can delete matches' },
        { status: 403 }
      );
    }

    // Delete the match
    await prisma.match.delete({
      where: { id: matchId }
    });

    return NextResponse.json({ message: 'Match deleted successfully' });

  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    );
  }
}
