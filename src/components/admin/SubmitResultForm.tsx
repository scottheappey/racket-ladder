'use client';

import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  email: string;
  rating: number | null;
}

interface Match {
  id: string;
  playerA: Player;
  playerB: Player;
  season: {
    id: string;
    name: string;
  };
}

interface SubmitResultFormProps {
  match: Match;
  onSubmitted?: () => void;
}

export default function SubmitResultForm({ match, onSubmitted }: SubmitResultFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    winnerId: '',
    setsJson: '',
    playedAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/matches/${match.id}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          winnerId: formData.winnerId,
          setsJson: formData.setsJson,
          playedAt: formData.playedAt || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit result');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Show Elo changes if available
      if (result.eloChanges) {
        console.log('Elo changes:', result.eloChanges);
      }

      if (onSubmitted) {
        onSubmitted();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateScorePresets = () => {
    const presets = [
      { label: '6-4, 6-3', value: '[6,4,6,3]' },
      { label: '6-2, 6-1', value: '[6,2,6,1]' },
      { label: '6-4, 3-6, 6-2', value: '[6,4,3,6,6,2]' },
      { label: '7-6, 6-4', value: '[7,6,6,4]' },
      { label: '6-0, 6-0', value: '[6,0,6,0]' }
    ];

    return presets;
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-900 mb-2">Result Submitted!</h3>
        <p className="text-green-700">
          The match result has been recorded and ratings have been updated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Match Result</h3>
      
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="text-sm font-medium text-gray-900">
          {match.playerA.name} vs {match.playerB.name}
        </div>
        <div className="text-sm text-gray-600">
          {match.season.name}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="winnerId" className="block text-sm font-medium text-gray-700">
            Winner
          </label>
          <select
            id="winnerId"
            value={formData.winnerId}
            onChange={(e) => setFormData({ ...formData, winnerId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select winner</option>
            <option value={match.playerA.id}>
              {match.playerA.name}
              {match.playerA.rating && ` (Rating: ${Math.round(match.playerA.rating)})`}
            </option>
            <option value={match.playerB.id}>
              {match.playerB.name}
              {match.playerB.rating && ` (Rating: ${Math.round(match.playerB.rating)})`}
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="setsJson" className="block text-sm font-medium text-gray-700">
            Score
          </label>
          <input
            type="text"
            id="setsJson"
            value={formData.setsJson}
            onChange={(e) => setFormData({ ...formData, setsJson: e.target.value })}
            placeholder="e.g., [6,4,6,3] for 6-4, 6-3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-1">
              {generateScorePresets().map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, setsJson: preset.value })}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="playedAt" className="block text-sm font-medium text-gray-700">
            Date & Time Played (Optional)
          </label>
          <input
            type="datetime-local"
            id="playedAt"
            value={formData.playedAt}
            onChange={(e) => setFormData({ ...formData, playedAt: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || !formData.winnerId || !formData.setsJson}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Result'}
          </button>
          
          <button
            type="button"
            onClick={() => onSubmitted && onSubmitted()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
