interface User {
  id: string
  name?: string | null
  email?: string | null
  role?: string
}

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quick actions */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              + New Season
            </button>
            
            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.name || user.email}
                </div>
                <div className="text-xs text-gray-600 capitalize">
                  {user.role?.toLowerCase().replace('_', ' ')}
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
