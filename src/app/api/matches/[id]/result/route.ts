import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubmitResultSchema } from '@/lib/validations/match';
import { calculateEloRatings, getKFactor } from '@/lib/elo';
import { auth } from '@/lib/auth-temp';
import { sendMatchResultNotification } from '@/lib/notifications';

/**
 * POST /api/matches/[id]/result - Submit match result and update ratings
 */
export async function POST(
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
    const body = await request.json();
    const validatedData = SubmitResultSchema.parse({
      ...body,
      matchId
    });

    // Get the match with players and season info
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        playerA: true,
        playerB: true,
        season: {
          include: {
            club: {
              include: {
                clubAdmins: true
              }
            },
            ladder: true
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
        { error: 'Match result already exists' },
        { status: 400 }
      );
    }

    // Check if user has permission to submit result
    const isPlayer = match.playerA.id === session.user.id || match.playerB.id === session.user.id;
    const isAdmin = match.season.club.clubAdmins.some(admin => admin.userId === session.user.id);
    
    if (!isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: 'Only match participants or club admins can submit results' },
        { status: 403 }
      );
    }

    // Validate winner is one of the players
    if (validatedData.winnerId !== match.playerA.id && validatedData.winnerId !== match.playerB.id) {
      return NextResponse.json(
        { error: 'Winner must be one of the match participants' },
        { status: 400 }
      );
    }

    // Parse and validate sets JSON
    let sets: number[];
    try {
      sets = JSON.parse(validatedData.setsJson);
      if (!Array.isArray(sets) || sets.length === 0) {
        throw new Error('Invalid sets format');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid sets format. Must be a JSON array of scores.' },
        { status: 400 }
      );
    }

    // Calculate Elo changes if this is a ladder season
    let playerANewRating = match.playerA.rating;
    let playerBNewRating = match.playerB.rating;
    let eloChanges = null;

    if (match.season.ladder && match.playerA.rating && match.playerB.rating) {
      // Get current ladder positions for games played count
      await prisma.ladderPlayer.findMany({
        where: {
          ladderId: match.season.ladder.id,
          playerId: { in: [match.playerA.id, match.playerB.id] }
        }
      });

      // Count previous matches for K-factor calculation
      const playerAMatches = await prisma.match.count({
        where: {
          OR: [
            { playerAId: match.playerA.id },
            { playerBId: match.playerA.id }
          ],
          result: { isNot: null }
        }
      });

      const playerBMatches = await prisma.match.count({
        where: {
          OR: [
            { playerAId: match.playerB.id },
            { playerBId: match.playerB.id }
          ],
          result: { isNot: null }
        }
      });

      // Determine scores (1 for win, 0 for loss)
      const playerAScore = validatedData.winnerId === match.playerA.id ? 1 : 0;
      const playerBScore = validatedData.winnerId === match.playerB.id ? 1 : 0;

      // Calculate new ratings
      eloChanges = calculateEloRatings({
        player1Rating: match.playerA.rating,
        player2Rating: match.playerB.rating,
        player1Score: playerAScore,
        player2Score: playerBScore,
        kFactor: Math.min(
          getKFactor(match.playerA.rating, playerAMatches),
          getKFactor(match.playerB.rating, playerBMatches)
        )
      });

      playerANewRating = eloChanges.player1NewRating;
      playerBNewRating = eloChanges.player2NewRating;
    }

    // Use transaction to update match, create result, and update ratings
    const result = await prisma.$transaction(async (tx) => {
      // Create the result
      const result = await tx.result.create({
        data: {
          matchId: matchId,
          winnerId: validatedData.winnerId,
          setsJson: validatedData.setsJson,
          reportedByPlayerId: session.user.id,
          reportedAt: validatedData.playedAt ? new Date(validatedData.playedAt) : new Date()
        }
      });

      // Update match status
      await tx.match.update({
        where: { id: matchId },
        data: { status: 'PLAYED' }
      });

      // Update player ratings if this is a ladder
      if (match.season.ladder && eloChanges) {
        await tx.player.update({
          where: { id: match.playerA.id },
          data: { rating: playerANewRating }
        });

        await tx.player.update({
          where: { id: match.playerB.id },
          data: { rating: playerBNewRating }
        });

        // Update ladder player ratings too
        const ladderPlayers = await tx.ladderPlayer.findMany({
          where: {
            ladderId: match.season.ladder.id,
            playerId: { in: [match.playerA.id, match.playerB.id] }
          }
        });

        for (const ladderPlayer of ladderPlayers) {
          const newRating = ladderPlayer.playerId === match.playerA.id 
            ? playerANewRating 
            : playerBNewRating;
          
          if (newRating !== null) {
            await tx.ladderPlayer.update({
              where: { id: ladderPlayer.id },
              data: { rating: newRating }
            });
          }
        }
      }

      return result;
    });

    // Send notifications to both players
    try {
      await sendMatchResultNotification({
        match: {
          id: matchId,
          playerA: {
            name: match.playerA.name,
            email: match.playerA.email
          },
          playerB: {
            name: match.playerB.name,
            email: match.playerB.email
          },
          winner: validatedData.winnerId === match.playerA.id ? match.playerA.name : match.playerB.name,
          scoreA: sets.length > 0 ? sets[0] : 0,
          scoreB: sets.length > 1 ? sets[1] : 0,
          eloChangeA: eloChanges?.player1Change || 0,
          eloChangeB: eloChanges?.player2Change || 0,
          newRatingA: playerANewRating || match.playerA.rating || 1000,
          newRatingB: playerBNewRating || match.playerB.rating || 1000
        },
        season: {
          name: match.season.name,
          sport: match.season.sport
        },
        club: {
          name: match.season.club.name
        }
      });
    } catch (emailError) {
      console.error('Failed to send match result notifications:', emailError);
      // Don't fail the API call if email fails
    }

    // Return the result with updated ratings info
    return NextResponse.json({
      result,
      eloChanges: eloChanges ? {
        playerA: {
          id: match.playerA.id,
          name: match.playerA.name,
          oldRating: match.playerA.rating,
          newRating: playerANewRating,
          change: eloChanges.player1Change
        },
        playerB: {
          id: match.playerB.id,
          name: match.playerB.name,
          oldRating: match.playerB.rating,
          newRating: playerBNewRating,
          change: eloChanges.player2Change
        }
      } : null
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting match result:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit match result' },
      { status: 500 }
    );
  }
}
