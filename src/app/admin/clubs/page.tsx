import Link from 'next/link'
import { db } from '@/lib/db'
import { ClubsTable } from '@/components/admin/ClubsTable'

export const dynamic = 'force-dynamic';

interface Club {
  id: string
  name: string
  slug: string
  country: string
  logoUrl: string | null
  createdAt: Date
  _count: {
    players: number
    seasons: number
    clubAdmins: number
  }
}

async function getClubs(): Promise<Club[]> {
  try {
    const clubs = await db.club.findMany({
      include: {
        _count: {
          select: {
            players: true,
            seasons: true,
            clubAdmins: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return clubs
  } catch {
    console.log('Database not available for clubs admin page')
    return []
  }
}

export default async function ClubsPage() {
  const clubs = await getClubs()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
          <p className="mt-2 text-gray-600">
            Manage tennis clubs and their settings
          </p>
        </div>
        <Link
          href="/admin/clubs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + New Club
        </Link>
      </div>

      {/* Clubs table */}
      <ClubsTable clubs={clubs} />
    </div>
  )
}
