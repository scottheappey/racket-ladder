import { Suspense } from 'react'
import { CSVImportForm } from '@/components/admin/CSVImportForm'

export const dynamic = 'force-dynamic';

export default function ImportPlayersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Players</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload a CSV file to bulk import players into a season
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">CSV Import</h2>
          <p className="mt-1 text-sm text-gray-600">
            Import players from a CSV file with columns: name, email, phone (optional), rating (optional)
          </p>
        </div>
        
        <div className="p-6">
          <Suspense fallback={<div>Loading import form...</div>}>
            <CSVImportForm />
          </Suspense>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements</h3>
        <div className="text-sm text-blue-700">
          <p className="mb-2">Your CSV file should have the following columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="bg-blue-100 px-1 rounded">name</code> - Player&apos;s full name (required)</li>
            <li><code className="bg-blue-100 px-1 rounded">email</code> - Player&apos;s email address (required)</li>
            <li><code className="bg-blue-100 px-1 rounded">phone</code> - Phone number (optional)</li>
            <li><code className="bg-blue-100 px-1 rounded">rating</code> - Player rating 0-3000 (optional)</li>
          </ul>
          <p className="mt-2">
            <strong>Example:</strong> <code className="bg-blue-100 px-1 rounded">name,email,phone,rating</code>
          </p>
        </div>
      </div>
    </div>
  )
}
