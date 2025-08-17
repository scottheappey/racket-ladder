'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Season {
  id: string
  name: string
  sport: 'TENNIS' | 'PICKLEBALL' | 'PADEL' | 'SQUASH'
  type: 'LADDER' | 'BOX'
  startDate: Date
  endDate: Date
  entryFeeCents: number | null
  isActive: boolean
  club: {
    name: string
    slug: string
  }
  _count: {
    matches: number
  }
}

interface SeasonsTableProps {
  seasons: Season[]
}

export function SeasonsTable({ seasons }: SeasonsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSeasons = seasons.filter(season =>
    season.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    season.club.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  const formatCurrency = (cents?: number) => {
    if (!cents) return 'Free'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search seasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Season
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSeasons.map((season) => (
              <tr key={season.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {season.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {season.sport}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/clubs/${season.club.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {season.club.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {season.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{formatDate(season.startDate)}</div>
                    <div className="text-gray-500">to {formatDate(season.endDate)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    -
                  </div>
                  <div className="text-sm text-gray-500">
                    {season._count.matches} matches
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {season.entryFeeCents ? formatCurrency(season.entryFeeCents) : 'Free'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    season.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {season.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/seasons/${season.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/seasons/${season.id}/players`}
                      className="text-green-600 hover:text-green-800"
                    >
                      Players
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSeasons.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500">No seasons found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
