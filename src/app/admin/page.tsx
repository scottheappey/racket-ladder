import { db } from '@/lib/db'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentActivity } from '@/components/admin/RecentActivity'

async function getStats() {
  try {
    const [clubCount, playerCount, seasonCount, matchCount] = await Promise.all([
      db.club.count(),
      db.player.count(),
      db.season.count({ where: { isActive: true } }),
      db.match.count()
    ])

    return {
      totalClubs: clubCount,
      totalPlayers: playerCount,
      activeSeasons: seasonCount,
      totalMatches: matchCount
    }
  } catch {
    console.log('Database not available for admin dashboard stats')
    return {
      totalClubs: 0,
      totalPlayers: 0,
      activeSeasons: 0,
      totalMatches: 0
    }
  }
}

async function getRecentMatches() {
  try {
    const recentMatches = await db.match.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        playerA: true,
        playerB: true,
        season: {
          include: {
            club: true
          }
        },
        result: {
          include: {
            winner: true
          }
        }
      }
    })
    return recentMatches
  } catch {
    console.log('Database not available for recent activity')
    return []
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const recentMatches = await getRecentMatches()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your ladder and box league management system
        </p>
      </div>

      {/* Dashboard stats */}
      <DashboardStats stats={stats} />

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity matches={recentMatches} />
        
        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/admin/clubs/new"
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">🏢</span>
                <div>
                  <div className="font-medium">Create New Club</div>
                  <div className="text-sm text-gray-600">Set up a new tennis club</div>
                </div>
              </div>
            </a>
            
            <a
              href="/admin/seasons/new"
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">📅</span>
                <div>
                  <div className="font-medium">Create New Season</div>
                  <div className="text-sm text-gray-600">Start a ladder or box league</div>
                </div>
              </div>
            </a>
            
            <a
              href="/admin/players/import"
              className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">📊</span>
                <div>
                  <div className="font-medium">Import Players</div>
                  <div className="text-sm text-gray-600">Upload CSV of players</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
