import { ClubAdminSignupForm } from '@/components/signup/ClubAdminSignupForm'

export default function ClubAdminSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-4xl">🎾</span>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Start Your Club
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create a racket sports club and manage your community
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ClubAdminSignupForm />
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Benefits</span>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">What you'll get:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Complete club management dashboard</li>
              <li>• Ladder and box league systems</li>
              <li>• Player registration and management</li>
              <li>• Match scheduling and results tracking</li>
              <li>• Payment processing integration</li>
              <li>• Magic invite links for easy signup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
