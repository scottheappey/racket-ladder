import { MatchStatus } from "@prisma/client";

interface Player {
  id: string;
  name: string;
  email: string;
  rating: number | null;
}

interface LadderPlayer {
  id: string;
  rating: number;
  player: Player;
}

interface Match {
  id: string;
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

interface Ladder {
  id: string;
  ladderPlayers: LadderPlayer[];
}

interface LadderViewProps {
  ladder: Ladder;
  matches: Match[];
}

export function LadderView({ ladder, matches }: LadderViewProps) {
  // Sort players by rating (highest first)
  const sortedPlayers = [...ladder.ladderPlayers].sort(
    (a, b) => b.rating - a.rating,
  );

  const recentMatches = matches.filter((match) => match.result).slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Ladder Standings */}
      <section className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Ladder Standings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matches
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPlayers.map((ladderPlayer, index) => {
                const playerMatches = matches.filter(
                  (match) =>
                    match.playerA.id === ladderPlayer.player.id ||
                    match.playerB.id === ladderPlayer.player.id,
                );
                const wins = playerMatches.filter(
                  (match) => match.result?.winner.id === ladderPlayer.player.id,
                ).length;
                const total = playerMatches.filter(
                  (match) => match.result,
                ).length;

                return (
                  <tr
                    key={ladderPlayer.id}
                    className={index < 3 ? "bg-yellow-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <span className="ml-2 text-yellow-500">👑</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ladderPlayer.player.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ladderPlayer.player.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round(ladderPlayer.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {wins}-{total - wins} ({total} played)
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <section className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Results
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentMatches.map((match) => {
              if (!match.result) return null;

              const sets = JSON.parse(match.result.setsJson) as Array<{
                playerAScore: number;
                playerBScore: number;
              }>;

              return (
                <div key={match.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
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
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {sets.map((set, index) => (
                          <span key={index} className="mx-1">
                            {set.playerAScore}-{set.playerBScore}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(match.result.reportedAt))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
