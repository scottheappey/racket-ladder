import { auth } from '@/lib/auth-temp'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/api/auth/signin')
  }
  
  if (session.user.role !== 'ADMIN' && session.user.role !== 'CLUB_ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
