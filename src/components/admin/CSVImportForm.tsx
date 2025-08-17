'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Season {
  id: string
  name: string
  club: {
    name: string
  }
}

export function CSVImportForm() {
  const router = useRouter()
  const [selectedSeason, setSelectedSeason] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Load seasons on component mount
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await fetch('/api/admin/seasons')
        if (response.ok) {
          const data = await response.json()
          setSeasons(data)
        }
      } catch (error) {
        console.error('Failed to load seasons:', error)
      }
    }
    loadSeasons()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      setPreview([])
      setShowPreview(false)
      return
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors({ file: 'Please select a CSV file' })
      return
    }

    setFile(selectedFile)
    setErrors({})

    // Parse CSV for preview
    try {
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const previewData = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })
      
      setPreview(previewData)
      setShowPreview(true)
    } catch {
      setErrors({ file: 'Failed to parse CSV file' })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!file || !selectedSeason) {
      setErrors({
        ...((!file) && { file: 'Please select a CSV file' }),
        ...((!selectedSeason) && { season: 'Please select a season' })
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('seasonId', selectedSeason)

      const response = await fetch('/api/admin/import/players', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import failed')
      }

      const result = await response.json()
      
      // Show success message and redirect
      alert(`Successfully imported ${result.imported} players`)
      router.push('/admin/players')
      router.refresh()
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Import failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{errors.submit}</div>
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
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          CSV File *
        </label>
        <input
          type="file"
          id="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          required
        />
        {errors.file && (
          <p className="mt-1 text-sm text-red-600">{errors.file}</p>
        )}
      </div>

      {showPreview && preview.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !file || !selectedSeason}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Importing...' : 'Import Players'}
        </button>
      </div>
    </form>
  )
}
