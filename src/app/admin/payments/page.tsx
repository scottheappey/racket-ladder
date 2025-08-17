import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-temp';
import { prisma } from '@/lib/prisma';
import PaymentsList from '@/components/admin/PaymentsList';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
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

  // Get seasons for the club that have entry fees
  const seasons = await prisma.season.findMany({
    where: { 
      clubId: clubAdmin.clubId,
      entryFeeCents: { not: null }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      sport: true,
      type: true,
      isActive: true,
      entryFeeCents: true,
      startDate: true,
      endDate: true
    }
  });

  // Get payment statistics
  const paymentStats = await prisma.payment.groupBy({
    by: ['status'],
    where: {
      season: {
        clubId: clubAdmin.clubId
      }
    },
    _count: {
      id: true
    },
    _sum: {
      amountCents: true
    }
  });

  const stats = {
    total: paymentStats.reduce((acc, stat) => acc + stat._count.id, 0),
    succeeded: paymentStats.find(s => s.status === 'SUCCEEDED')?._count.id || 0,
    pending: paymentStats.find(s => s.status === 'REQUIRES_PAYMENT')?._count.id || 0,
    failed: paymentStats.find(s => s.status === 'FAILED')?._count.id || 0,
    totalRevenue: paymentStats
      .filter(s => s.status === 'SUCCEEDED')
      .reduce((acc, stat) => acc + (stat._sum.amountCents || 0), 0)
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage entry fee payments for your club seasons.
          </p>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${(stats.totalRevenue / 100).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Successful</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.succeeded}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.failed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="mt-8">
        {clubAdmin && (
          <PaymentsList seasons={seasons} />
        )}
      </div>
    </div>
  );
}
