import { MatchStatus } from "@prisma/client";

interface Player {
  id: string;
  name: string;
  email: string;
  rating: number | null;
}

interface BoxPlayer {
  id: string;
  seed: number;
  player: Player;
}

interface Box {
  id: string;
  name: string;
  order: number;
  boxPlayers: BoxPlayer[];
}

interface Match {
  id: string;
  boxId: string | null;
  playerA: Player;
  playerB: Player;
  scheduledAt: Date | null;
  status: MatchStatus;
  result?: {
    winner: Player;
    setsJson: string;
    reportedAt: Date;
  } | null;
}

interface BoxViewProps {
  boxes: Box[];
  matches: Match[];
}

export function BoxView({ boxes, matches }: BoxViewProps) {
  const getBoxMatches = (boxId: string) => {
    return matches.filter((match) => match.boxId === boxId);
  };

  const getPlayerStats = (playerId: string, boxMatches: Match[]) => {
    const playerMatches = boxMatches.filter(
      (match) => match.playerA.id === playerId || match.playerB.id === playerId,
    );
    const wins = playerMatches.filter(
      (match) => match.result?.winner.id === playerId,
    ).length;
    const played = playerMatches.filter((match) => match.result).length;

    return {
      wins,
      played,
      winPercentage: played > 0 ? (wins / played) * 100 : 0,
    };
  };

  const getBoxStandings = (box: Box) => {
    const boxMatches = getBoxMatches(box.id);

    return box.boxPlayers
      .map((boxPlayer) => ({
        ...boxPlayer,
        stats: getPlayerStats(boxPlayer.player.id, boxMatches),
      }))
      .sort((a, b) => {
        // Sort by wins, then by win percentage
        if (a.stats.wins !== b.stats.wins) {
          return b.stats.wins - a.stats.wins;
        }
        return b.stats.winPercentage - a.stats.winPercentage;
      });
  };

  return (
    <div className="space-y-8">
      {boxes.map((box) => {
        const boxMatches = getBoxMatches(box.id);
        const standings = getBoxStandings(box);
        const recentResults = boxMatches
          .filter((match) => match.result)
          .slice(0, 5);

        return (
          <section
            key={box.id}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {box.name}
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* Box Standings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Standings
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Pos
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Player
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          W-L
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Win %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {standings.map((player, index) => (
                        <tr
                          key={player.id}
                          className={index === 0 ? "bg-green-50" : ""}
                        >
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            #{index + 1}
                            {index === 0 && (
                              <span className="ml-1 text-green-500">↑</span>
                            )}
                            {index === standings.length - 1 &&
                              standings.length > 2 && (
                                <span className="ml-1 text-red-500">↓</span>
                              )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm font-medium text-gray-900">
                              {player.player.name}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {player.stats.wins}-
                            {player.stats.played - player.stats.wins}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {player.stats.played > 0
                              ? `${player.stats.winPercentage.toFixed(0)}%`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Results */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Results
                </h3>
                {recentResults.length > 0 ? (
                  <div className="space-y-3">
                    {recentResults.map((match) => {
                      if (!match.result) return null;

                      const sets = JSON.parse(match.result.setsJson) as Array<{
                        playerAScore: number;
                        playerBScore: number;
                      }>;

                      return (
                        <div
                          key={match.id}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                        >
                          <div className="text-sm">
                            <span
                              className={`font-medium ${match.result.winner.id === match.playerA.id ? "text-green-600" : "text-gray-900"}`}
                            >
                              {match.playerA.name}
                            </span>
                            <span className="text-gray-500 mx-2">vs</span>
                            <span
                              className={`font-medium ${match.result.winner.id === match.playerB.id ? "text-green-600" : "text-gray-900"}`}
                            >
                              {match.playerB.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {sets.map((set, index) => (
                                <span key={index} className="mx-1">
                                  {set.playerAScore}-{set.playerBScore}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No results yet</p>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {boxes.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No boxes created
          </h3>
          <p className="text-gray-600">
            This season doesn&apos;t have any boxes set up yet.
          </p>
        </div>
      )}
    </div>
  );
}
