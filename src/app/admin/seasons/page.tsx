import { Suspense } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { SeasonsTable } from '@/components/admin/SeasonsTable'

async function getSeasons() {
  try {
    const seasons = await db.season.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        club: {
          select: {
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            matches: true,
          }
        }
      }
    })
    return seasons
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return []
  }
}

export default async function SeasonsPage() {
  const seasons = await getSeasons()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seasons</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage seasons across all clubs
          </p>
        </div>
        <Link
          href="/admin/seasons/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          New Season
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Suspense fallback={<div className="p-6">Loading seasons...</div>}>
          <SeasonsTable seasons={seasons} />
        </Suspense>
      </div>

      {seasons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No seasons</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new season.</p>
            <div className="mt-6">
              <Link
                href="/admin/seasons/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                New Season
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
