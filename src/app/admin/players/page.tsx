import { Suspense } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { PlayersTable } from '@/components/admin/PlayersTable'

export const dynamic = 'force-dynamic';

async function getPlayers() {
  try {
    const players = await db.player.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        club: {
          select: {
            name: true,
            slug: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            matchesA: true,
            matchesB: true,
          }
        }
      }
    })
    return players
  } catch (error) {
    console.error('Error fetching players:', error)
    return []
  }
}

export default async function PlayersPage() {
  const players = await getPlayers()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage players across all clubs
          </p>
        </div>
        <Link
          href="/admin/players/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          New Player
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Suspense fallback={<div className="p-6">Loading players...</div>}>
          <PlayersTable players={players} />
        </Suspense>
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new player.</p>
            <div className="mt-6">
              <Link
                href="/admin/players/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                New Player
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
