'use client';

import { useState, useEffect } from 'react';

interface Season {
  id: string
  name: string
  club: {
    name: string
  }
}

interface MagicInvite {
  id: string
  token: string
  expiresAt: string
  season: {
    name: string
    club: {
      name: string
    }
  }
}

export function MagicInviteForm() {
  const [selectedSeason, setSelectedSeason] = useState('')
  const [expiryDays, setExpiryDays] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [invites, setInvites] = useState<MagicInvite[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generatedLink, setGeneratedLink] = useState('')

  // Load seasons and existing invites
  useEffect(() => {
    const loadData = async () => {
      try {
        const [seasonsRes, invitesRes] = await Promise.all([
          fetch('/api/admin/seasons'),
          fetch('/api/admin/magic-invites')
        ])
        
        if (seasonsRes.ok) {
          const seasonsData = await seasonsRes.json()
          setSeasons(seasonsData)
        }
        
        if (invitesRes.ok) {
          const invitesData = await invitesRes.json()
          setInvites(invitesData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedSeason) {
      setErrors({ season: 'Please select a season' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/admin/magic-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seasonId: selectedSeason,
          expiryDays: parseInt(expiryDays)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create magic invite')
      }

      const result = await response.json()
      const baseUrl = window.location.origin
      const magicLink = `${baseUrl}/join/${result.token}`
      
      setGeneratedLink(magicLink)
      setSelectedSeason('')
      setExpiryDays('30')
      
      // Reload invites list
      const invitesRes = await fetch('/api/admin/magic-invites')
      if (invitesRes.ok) {
        const invitesData = await invitesRes.json()
        setInvites(invitesData)
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create magic invite'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{errors.submit}</div>
          </div>
        )}

        {generatedLink && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Magic Link Generated!</h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border text-sm">
                {generatedLink}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedLink)}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">
            Select Season *
          </label>
          <select
            id="season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a season...</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} - {season.club.name}
              </option>
            ))}
          </select>
          {errors.season && (
            <p className="mt-1 text-sm text-red-600">{errors.season}</p>
          )}
        </div>

        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
            Expires In (Days)
          </label>
          <select
            id="expiry"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !selectedSeason}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Magic Link'}
          </button>
        </div>
      </form>

      {/* Existing Invites */}
      {invites.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Magic Invites</h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => {
                  const isExpired = new Date(invite.expiresAt) < new Date()
                  const magicLink = `${window.location.origin}/join/${invite.token}`
                  
                  return (
                    <tr key={invite.id} className={`${isExpired ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invite.season.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invite.season.club.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Active
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invite.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => copyToClipboard(magicLink)}
                          disabled={isExpired}
                          className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
