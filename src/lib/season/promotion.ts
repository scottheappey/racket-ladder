import { db } from "../db";

export interface PromotionResult {
  promotedPlayers: Array<{ playerId: string; fromBox: string; toBox: string }>;
  relegatedPlayers: Array<{ playerId: string; fromBox: string; toBox: string }>;
}

export async function processSeasonPromotion(
  seasonId: string,
): Promise<PromotionResult> {
  const season = await db.season.findUnique({
    where: { id: seasonId },
    include: {
      boxes: {
        include: {
          boxPlayers: {
            include: {
              player: true,
            },
            orderBy: { seed: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      promotionRules: true,
    },
  });

  if (
    !season ||
    season.type !== "BOX" ||
    !season.promotionRules ||
    season.promotionRules.length === 0
  ) {
    throw new Error("Invalid season for promotion processing");
  }

  const { upCount, downCount } = season.promotionRules[0];
  const promotedPlayers: Array<{
    playerId: string;
    fromBox: string;
    toBox: string;
  }> = [];
  const relegatedPlayers: Array<{
    playerId: string;
    fromBox: string;
    toBox: string;
  }> = [];

  // TODO: Implement actual standings calculation based on match results
  // For now, we'll use the current seed as a placeholder

  for (let i = 0; i < season.boxes.length; i++) {
    const currentBox = season.boxes[i];
    const upperBox = i > 0 ? season.boxes[i - 1] : null;
    const lowerBox = i < season.boxes.length - 1 ? season.boxes[i + 1] : null;

    // Promote top players to upper box
    if (upperBox && upCount > 0) {
      const topPlayers = currentBox.boxPlayers.slice(0, upCount);
      for (const boxPlayer of topPlayers) {
        promotedPlayers.push({
          playerId: boxPlayer.playerId,
          fromBox: currentBox.name,
          toBox: upperBox.name,
        });
      }
    }

    // Relegate bottom players to lower box
    if (lowerBox && downCount > 0) {
      const bottomPlayers = currentBox.boxPlayers.slice(-downCount);
      for (const boxPlayer of bottomPlayers) {
        relegatedPlayers.push({
          playerId: boxPlayer.playerId,
          fromBox: currentBox.name,
          toBox: lowerBox.name,
        });
      }
    }
  }

  return {
    promotedPlayers,
    relegatedPlayers,
  };
}
