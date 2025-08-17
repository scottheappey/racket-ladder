import Link from 'next/link'
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UsersIcon,
  TrophyIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  CreditCardIcon,
  BellIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  name?: string | null
  email?: string | null
  role?: string
}

interface AdminSidebarProps {
  user: User
}

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Clubs', href: '/admin/clubs', icon: BuildingOfficeIcon },
    { name: 'Seasons', href: '/admin/seasons', icon: CalendarIcon },
    { name: 'Players', href: '/admin/players', icon: UsersIcon },
    { name: 'Matches', href: '/admin/matches', icon: TrophyIcon },
    { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
    { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
    { name: 'Import Players', href: '/admin/import', icon: DocumentArrowUpIcon },
    { name: 'Magic Invites', href: '/admin/magic-invites', icon: LinkIcon },
  ]

export function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-xl">🎾</span>
          <span className="ml-2 text-lg font-semibold text-gray-900">
            Racket Ladders
          </span>
        </div>
        
        {/* User info */}
        <div className="mt-5 px-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900">
              {user.name || user.email}
            </div>
            <div className="text-xs text-gray-600 capitalize">
              {user.role?.toLowerCase().replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <SidebarItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-2">
          <Link
            href="/api/auth/signout"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="mr-3">🚪</span>
            Sign out
          </Link>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ item }: { item: typeof navigation[0] }) {
  // Note: We'll need to convert this to a client component if we want to use usePathname
  // For now, we'll create a simpler version
  return (
    <Link
      href={item.href}
      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    >
      <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
      {item.name}
    </Link>
  )
}
