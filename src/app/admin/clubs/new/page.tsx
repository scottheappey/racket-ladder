import { CreateClubForm } from '@/components/admin/CreateClubForm'

export default function NewClubPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Club</h1>
        <p className="mt-2 text-gray-600">
          Set up a new tennis club to manage seasons and players
        </p>
      </div>

      {/* Create club form */}
      <div className="max-w-2xl">
        <CreateClubForm />
      </div>
    </div>
  )
}
