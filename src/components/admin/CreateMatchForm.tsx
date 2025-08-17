'use client';

import { useState } from 'react';
import { CreateMatchInput } from '@/lib/validations/match';

interface Season {
  id: string;
  name: string;
  sport: string;
  type: string;
  isActive: boolean;
}

interface Player {
  id: string;
  name: string;
  email: string;
  rating: number | null;
}

interface CreateMatchFormProps {
  seasons: Season[];
  players: Player[];
}

export default function CreateMatchForm({ seasons, players }: CreateMatchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateMatchInput>>({
    seasonId: '',
    playerAId: '',
    playerBId: '',
    scheduledAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          scheduledAt: formData.scheduledAt || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create match');
      }

      setSuccess(true);
      setFormData({
        seasonId: '',
        playerAId: '',
        playerBId: '',
        scheduledAt: ''
      });

      // Refresh the page to show the new match
      window.location.reload();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSeasonPlayers = formData.seasonId 
    ? players.filter(() => {
        // For now, show all players - in a real app you'd filter by season
        return true;
      })
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Match created successfully!
        </div>
      )}

      <div>
        <label htmlFor="seasonId" className="block text-sm font-medium text-gray-700">
          Season
        </label>
        <select
          id="seasonId"
          value={formData.seasonId}
          onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a season</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} ({season.sport}, {season.type})
              {!season.isActive && ' - Inactive'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="playerAId" className="block text-sm font-medium text-gray-700">
          Player A
        </label>
        <select
          id="playerAId"
          value={formData.playerAId}
          onChange={(e) => setFormData({ ...formData, playerAId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select Player A</option>
          {selectedSeasonPlayers.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} ({player.email})
              {player.rating && ` - Rating: ${Math.round(player.rating)}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="playerBId" className="block text-sm font-medium text-gray-700">
          Player B
        </label>
        <select
          id="playerBId"
          value={formData.playerBId}
          onChange={(e) => setFormData({ ...formData, playerBId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select Player B</option>
          {selectedSeasonPlayers
            .filter(player => player.id !== formData.playerAId)
            .map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.email})
                {player.rating && ` - Rating: ${Math.round(player.rating)}`}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
          Scheduled Date & Time (Optional)
        </label>
        <input
          type="datetime-local"
          id="scheduledAt"
          value={formData.scheduledAt}
          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.seasonId || !formData.playerAId || !formData.playerBId}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating...' : 'Create Match'}
      </button>
    </form>
  );
}
