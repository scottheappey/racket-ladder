import { NotificationTestForm } from '@/components/admin/NotificationTestForm'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-gray-600">
          Manage and test the notification system
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">📧 Email Notifications</h2>
            <p className="text-gray-600">
              The system automatically sends email notifications for:
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">🎾 Match Results</h3>
              <p className="text-sm text-gray-600">
                Sent to both players when a match result is submitted, including:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Match outcome and score</li>
                <li>Elo rating changes</li>
                <li>New ratings</li>
                <li>Personalized message for winner/loser</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">💳 Payment Confirmations</h3>
              <p className="text-sm text-gray-600">
                Sent when payments are processed:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Payment success confirmations</li>
                <li>Payment failure notifications</li>
                <li>Season registration details</li>
                <li>Next steps for players</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">✉️ Magic Invites</h3>
              <p className="text-sm text-gray-600">
                Sent when inviting players to join:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Club and season information</li>
                <li>One-click join links</li>
                <li>What to expect overview</li>
                <li>Club contact details</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">🚀 Season Updates</h3>
              <p className="text-sm text-gray-600">
                Sent for important season events:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Season start announcements</li>
                <li>Registration reminders</li>
                <li>Ladder updates</li>
                <li>Match scheduling notices</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">🧪 Test Notifications</h2>
            <p className="text-gray-600">
              Send test notifications to verify email delivery and formatting
            </p>
          </div>
          <NotificationTestForm />
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold">⚙️ Configuration</h2>
            <p className="text-gray-600">
              Notification system configuration and status
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Provider</h3>
                <p className="text-sm text-gray-600">Resend API integration</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">From Address</h3>
                <p className="text-sm text-gray-600">noreply@racketladders.com</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Templates</h3>
                <p className="text-sm text-gray-600">HTML email templates with responsive design</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Environment Variables Required:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code> - Resend API key for sending emails</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
