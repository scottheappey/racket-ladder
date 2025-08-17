import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-temp';
import { prisma } from '@/lib/prisma';
import MatchList from '@/components/admin/MatchList';
import CreateMatchForm from '@/components/admin/CreateMatchForm';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get user's club admin status
  const clubAdmin = await prisma.clubAdmin.findFirst({
    where: { userId: session.user.id },
    include: { club: true }
  });

  if (!clubAdmin) {
    redirect('/');
  }

  // Get seasons for the club
  const seasons = await prisma.season.findMany({
    where: { clubId: clubAdmin.clubId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      sport: true,
      type: true,
      isActive: true
    }
  });

  // Get players for the club
  const players = await prisma.player.findMany({
    where: { clubId: clubAdmin.clubId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      rating: true
    }
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Matches</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage matches for your club seasons.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Create Match Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Match</h2>
          <CreateMatchForm seasons={seasons} players={players} />
        </div>

        {/* Match List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Matches</h2>
          <MatchList seasons={seasons} />
        </div>
      </div>
    </div>
  );
}
