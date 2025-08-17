'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/lib/stripe';

interface Season {
  id: string;
  name: string;
  sport: string;
  type: string;
  isActive: boolean;
  entryFeeCents: number | null;
  startDate: Date;
  endDate: Date;
}

interface Payment {
  id: string;
  amountCents: number;
  status: 'REQUIRES_PAYMENT' | 'SUCCEEDED' | 'FAILED';
  createdAt: string;
  stripePaymentIntentId: string | null;
  player: {
    id: string;
    name: string;
    email: string;
  };
  season: {
    id: string;
    name: string;
  };
}

interface PaymentsListProps {
  seasons: Season[];
}

export default function PaymentsList({ seasons }: PaymentsListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeason) params.append('seasonId', selectedSeason);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/payments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedStatus]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'SUCCEEDED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REQUIRES_PAYMENT':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'Paid';
      case 'REQUIRES_PAYMENT':
        return 'Pending';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Entry Fee Payments</h3>
        
        {/* Filters */}
        <div className="mt-4 flex space-x-4">
          <div className="flex-1">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="">All seasons</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} - {formatCurrency(season.entryFeeCents || 0)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              <option value="">All statuses</option>
              <option value="SUCCEEDED">Paid</option>
              <option value="REQUIRES_PAYMENT">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No payments match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.player.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.player.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.season.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amountCents)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(payment.status)}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.stripePaymentIntentId && (
                        <a
                          href={`https://dashboard.stripe.com/payments/${payment.stripePaymentIntentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View in Stripe
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <button
          onClick={fetchPayments}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
