/**
 * Elo Rating System Implementation
 * Standard Elo calculation with configurable K-factor
 */

export interface EloResult {
  player1NewRating: number;
  player2NewRating: number;
  player1Change: number;
  player2Change: number;
}

export interface EloCalculationParams {
  player1Rating: number;
  player2Rating: number;
  player1Score: number; // 1 for win, 0.5 for draw, 0 for loss
  player2Score: number; // 1 for win, 0.5 for draw, 0 for loss
  kFactor?: number; // Default 32 for active players
}

/**
 * Calculate expected score for a player given rating difference
 */
function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new Elo ratings after a match
 */
export function calculateEloRatings({
  player1Rating,
  player2Rating,
  player1Score,
  player2Score,
  kFactor = 32
}: EloCalculationParams): EloResult {
  // Validate scores
  if (player1Score + player2Score !== 1) {
    throw new Error('Scores must sum to 1 (one winner, or 0.5 each for draw)');
  }

  // Calculate expected scores
  const player1Expected = calculateExpectedScore(player1Rating, player2Rating);
  const player2Expected = calculateExpectedScore(player2Rating, player1Rating);

  // Calculate rating changes
  const player1Change = Math.round(kFactor * (player1Score - player1Expected));
  const player2Change = Math.round(kFactor * (player2Score - player2Expected));

  // Calculate new ratings
  const player1NewRating = player1Rating + player1Change;
  const player2NewRating = player2Rating + player2Change;

  return {
    player1NewRating,
    player2NewRating,
    player1Change,
    player2Change
  };
}

/**
 * Get K-factor based on player rating and experience
 * - New players (under 30 games): K=40
 * - Active players (30+ games, under 2400 rating): K=32
 * - Masters (2400+ rating): K=16
 */
export function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return 40;
  if (rating >= 2400) return 16;
  return 32;
}

/**
 * Calculate Elo change preview without applying
 */
export function previewEloChange({
  player1Rating,
  player2Rating,
  player1Score,
  player2Score,
  player1Games = 30,
  player2Games = 30
}: EloCalculationParams & {
  player1Games?: number;
  player2Games?: number;
}): EloResult {
  const k1 = getKFactor(player1Rating, player1Games);
  const k2 = getKFactor(player2Rating, player2Games);
  
  // Use average K-factor for simplicity
  const avgK = (k1 + k2) / 2;
  
  return calculateEloRatings({
    player1Rating,
    player2Rating,
    player1Score,
    player2Score,
    kFactor: avgK
  });
}
