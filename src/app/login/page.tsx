'use client'

import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="text-4xl">🎾</span>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Welcome to Racket Ladders
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">New to Racket Ladders?</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-3">
            <a
              href="/signup/player"
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="mr-2">🏓</span>
              Sign up as Player
            </a>
            
            <a
              href="/signup/club-admin"
              className="w-full inline-flex justify-center py-3 px-4 border border-green-300 rounded-md shadow-sm bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              <span className="mr-2">🏢</span>
              Start Your Club
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
