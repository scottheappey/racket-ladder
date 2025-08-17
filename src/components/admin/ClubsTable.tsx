import Link from 'next/link'
import Image from 'next/image'

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

interface ClubsTableProps {
  clubs: Club[]
}

export function ClubsTable({ clubs }: ClubsTableProps) {
  if (clubs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first tennis club
          </p>
          <Link
            href="/admin/clubs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Create Club
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seasons
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clubs.map((club) => (
              <tr key={club.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {club.logoUrl ? (
                      <Image
                        className="h-10 w-10 rounded-lg object-cover"
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {club.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {club.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        /{club.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {club.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {club._count.players}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {club._count.seasons}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {club._count.clubAdmins}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).format(new Date(club.createdAt))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="text-blue-600 hover:text-blue-900"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/clubs/${club.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
