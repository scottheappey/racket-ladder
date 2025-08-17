import { PlayerSignupForm } from '@/components/signup/PlayerSignupForm'

export default function PlayerSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-4xl">🎾</span>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Join as Player
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your player account to join clubs and competitions
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <PlayerSignupForm />
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">What's next?</span>
            </div>
          </div>
          
          <div className="mt-6 bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">After signing up:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Browse clubs in your area</li>
              <li>• Wait for magic invite links from clubs</li>
              <li>• Join ladder competitions and box leagues</li>
              <li>• Track your matches and rankings</li>
              <li>• Connect with other players</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Looking to manage a club? 
              <a href="/signup/club-admin" className="text-blue-600 hover:text-blue-500 ml-1">
                Start a club instead
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
