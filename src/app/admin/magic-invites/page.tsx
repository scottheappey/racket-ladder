import { Suspense } from 'react'
import { MagicInviteForm } from '@/components/admin/MagicInviteForm'

export default function MagicInvitePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Magic Join Links</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create magic join links that allow players to register for seasons with a single click
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Create Magic Invite</h2>
          <p className="mt-1 text-sm text-gray-600">
            Generate a shareable link that automatically registers players for a season
          </p>
        </div>
        
        <div className="p-6">
          <Suspense fallback={<div>Loading invite form...</div>}>
            <MagicInviteForm />
          </Suspense>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">How Magic Links Work</h3>
        <div className="text-sm text-green-700">
          <ul className="list-disc list-inside space-y-1">
            <li>Share the generated link with players via WhatsApp, email, or social media</li>
            <li>Players click the link and are taken to a simple registration form</li>
            <li>They only need to enter their name and email to join the season</li>
            <li>The link automatically knows which season they&apos;re joining</li>
            <li>Perfect for quick WhatsApp invites and QR codes on posters</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
