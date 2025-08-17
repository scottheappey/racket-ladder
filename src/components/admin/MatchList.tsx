'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Season {
  id: string;
  name: string;
  sport: string;
  type: string;
  isActive: boolean;
}

interface Match {
  id: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  playerA: {
    id: string;
    name: string;
    email: string;
    rating: number | null;
  };
  playerB: {
    id: string;
    name: string;
    email: string;
    rating: number | null;
  };
  season: {
    id: string;
    name: string;
  };
  result?: {
    winner: {
      id: string;
      name: string;
    };
    reportedByPlayer: {
      id: string;
      name: string;
    };
    setsJson: string;
    reportedAt: string;
  };
}

interface MatchListProps {
  seasons: Season[];
}

export default function MatchList({ seasons }: MatchListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeason) params.append('seasonId', selectedSeason);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('limit', '20');

      const response = await fetch(`/api/matches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedStatus]);

  useEffect(() => {
    fetchMatches();
  }, [selectedSeason, selectedStatus, fetchMatches]);

  const handleSubmitResult = async (matchId: string) => {
    // This would open a modal or navigate to result submission page
    // For now, just alert
    alert(`Submit result for match ${matchId} - this would open a result submission form`);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'PLAYED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'WALKOVER':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="">All seasons</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
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
            <option value="PENDING">Pending</option>
            <option value="PLAYED">Played</option>
            <option value="WALKOVER">Walkover</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Match List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No matches found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{match.playerA.name}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="font-medium">{match.playerB.name}</span>
                    <span className={getStatusBadge(match.status)}>
                      {match.status}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-600">
                    <span>{match.season.name}</span>
                    {match.scheduledAt && (
                      <span className="ml-3">
                        Scheduled: {new Date(match.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="ml-3">
                      Created {formatDistanceToNow(new Date(match.createdAt))} ago
                    </span>
                  </div>

                  {match.result && (
                    <div className="mt-2 text-sm text-green-700">
                      Winner: {match.result.winner.name} | 
                      Sets: {match.result.setsJson} |
                      Reported by: {match.result.reportedByPlayer.name}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {match.status === 'PENDING' && (
                    <button
                      onClick={() => handleSubmitResult(match.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Submit Result
                    </button>
                  )}
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchMatches}
        className="w-full text-center py-2 text-sm text-indigo-600 hover:text-indigo-500"
      >
        Refresh
      </button>
    </div>
  );
}
