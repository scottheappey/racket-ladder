import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { JoinForm } from '@/components/join/JoinForm'

interface JoinPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params

  // Find the magic invite
  const magicInvite = await db.magicInvite.findUnique({
    where: { token },
    include: {
      season: {
        include: {
          club: true
        }
      }
    }
  })

  if (!magicInvite) {
    notFound()
  }

  // Check if invite is expired
  const isExpired = new Date(magicInvite.expiresAt) < new Date()
  
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation link has expired. Please contact the club organizer for a new invitation.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Season:</strong> {magicInvite.season.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Club:</strong> {magicInvite.season.club.name}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-green-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Season</h1>
            <p className="text-gray-600">
              You&apos;ve been invited to join a season at {magicInvite.season.club.name}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Season Details</h3>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">
                <strong>Season:</strong> {magicInvite.season.name}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Club:</strong> {magicInvite.season.club.name}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Location:</strong> {magicInvite.season.club.country}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Sport:</strong> {magicInvite.season.sport}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Format:</strong> {magicInvite.season.type}
              </p>
            </div>
          </div>

          <JoinForm 
            seasonId={magicInvite.season.id}
            clubId={magicInvite.season.club.id}
            token={token}
          />
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: JoinPageProps) {
  const { token } = await params

  const magicInvite = await db.magicInvite.findUnique({
    where: { token },
    include: {
      season: {
        include: {
          club: true
        }
      }
    }
  })

  if (!magicInvite) {
    return {
      title: 'Join Season - Racket Ladders'
    }
  }

  return {
    title: `Join ${magicInvite.season.name} at ${magicInvite.season.club.name} - Racket Ladders`,
    description: `Join ${magicInvite.season.name} at ${magicInvite.season.club.name}. Quick registration for ${magicInvite.season.sport} ${magicInvite.season.type} competition.`,
    openGraph: {
      title: `Join ${magicInvite.season.name}`,
      description: `Join ${magicInvite.season.sport} ${magicInvite.season.type} at ${magicInvite.season.club.name}`,
      type: 'website',
    },
  }
}
