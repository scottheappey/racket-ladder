'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clubSchema } from '@/lib/validation/schemas'

export function CreateClubForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      country: formData.get('country') as string,
      logoUrl: formData.get('logoUrl') as string || undefined,
    }

    // Validate data
    const validation = clubSchema.safeParse(data)
    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message
        }
      })
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create club')
      }

      await response.json()
      router.push('/admin/clubs')
      router.refresh()
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create club'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{errors.submit}</div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Club Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Riverside Tennis Club"
            onChange={(e) => {
              const slugInput = document.getElementById('slug') as HTMLInputElement
              if (slugInput && !slugInput.value) {
                slugInput.value = generateSlug(e.target.value)
              }
            }}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            URL Slug *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              /clubs/
            </span>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              className="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="riverside-tennis"
              pattern="^[a-z0-9-]+$"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Only lowercase letters, numbers, and hyphens allowed
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <input
            type="text"
            name="country"
            id="country"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., United States"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
            Logo URL (optional)
          </label>
          <input
            type="url"
            name="logoUrl"
            id="logoUrl"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
          {errors.logoUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
          )}
        </div>

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
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Club'}
          </button>
        </div>
      </form>
    </div>
  )
}
