const K_FACTOR = 16;

export interface EloResult {
  playerARating: number;
  playerBRating: number;
}

export function calculateElo(
  playerARating: number,
  playerBRating: number,
  winner: "A" | "B",
): EloResult {
  const expectedA =
    1 / (1 + Math.pow(10, (playerBRating - playerARating) / 400));
  const expectedB =
    1 / (1 + Math.pow(10, (playerARating - playerBRating) / 400));

  const actualA = winner === "A" ? 1 : 0;
  const actualB = winner === "B" ? 1 : 0;

  const newRatingA = Math.round(
    playerARating + K_FACTOR * (actualA - expectedA),
  );
  const newRatingB = Math.round(
    playerBRating + K_FACTOR * (actualB - expectedB),
  );

  return {
    playerARating: newRatingA,
    playerBRating: newRatingB,
  };
}
