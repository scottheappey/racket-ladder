interface Match {
  id: string
  createdAt: Date
  playerA: {
    name: string
  }
  playerB: {
    name: string
  }
  season: {
    name: string
    club: {
      name: string
    }
  }
  result?: {
    winner: {
      name: string
    }
  } | null
}

interface RecentActivityProps {
  matches: Match[]
}

export function RecentActivity({ matches }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      
      {matches.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m-6-6l6-6" />
            </svg>
          </div>
          <p className="text-gray-600">No recent activity</p>
          <p className="text-sm text-gray-500">Matches will appear here once they&apos;re created</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{match.playerA.name}</span>
                  <span className="text-gray-500">vs</span>
                  <span className="font-medium">{match.playerB.name}</span>
                  {match.result && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Won by {match.result.winner.name}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {match.season.club.name} • {match.season.name}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric'
                }).format(new Date(match.createdAt))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
