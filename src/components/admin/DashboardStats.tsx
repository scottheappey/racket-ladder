interface Stats {
  totalClubs: number
  totalPlayers: number
  activeSeasons: number
  totalMatches: number
}

interface DashboardStatsProps {
  stats: Stats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      name: 'Total Clubs',
      value: stats.totalClubs,
      icon: '🏢',
      color: 'bg-blue-500'
    },
    {
      name: 'Total Players',
      value: stats.totalPlayers,
      icon: '👥',
      color: 'bg-green-500'
    },
    {
      name: 'Active Seasons',
      value: stats.activeSeasons,
      icon: '📅',
      color: 'bg-yellow-500'
    },
    {
      name: 'Total Matches',
      value: stats.totalMatches,
      icon: '🎾',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${item.color} rounded-lg p-3`}>
              <span className="text-white text-xl">{item.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
