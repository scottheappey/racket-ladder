'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Match {
  id: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  scheduledAt?: Date
  createdAt: Date
  season: {
    name: string
    club: {
      name: string
      slug: string
    }
  }
  playerA: {
    name: string
    email: string
  }
  playerB: {
    name: string
    email: string
  }
  result?: {
    winner: {
      name: string
    }
    reportedAt: Date
  }
}

interface MatchesTableProps {
  matches: Match[]
}

export function MatchesTable({ matches }: MatchesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL')

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.playerA.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.playerB.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.season.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.season.club.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || match.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Season
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Result
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
            {filteredMatches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {match.playerA.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    vs {match.playerB.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {match.season.name}
                  </div>
                  <Link
                    href={`/clubs/${match.season.club.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {match.season.club.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.scheduledAt ? formatDateTime(match.scheduledAt) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.result ? (
                    <div>
                      <div className="font-medium">
                        Winner: {match.result.winner.name}
                      </div>
                      <div className="text-gray-500">
                        {formatDateTime(match.result.reportedAt)}
                      </div>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(match.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/matches/${match.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                    {match.status === 'SCHEDULED' && (
                      <Link
                        href={`/admin/matches/${match.id}/report`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Report
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMatches.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500">No matches found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
