import Link from "next/link";
import { Sport, SeasonType } from "@prisma/client";

interface Season {
  id: string;
  name: string;
  sport: Sport;
  type: SeasonType;
  startDate: Date;
  endDate: Date;
  entryFeeCents: number | null;
  _count: {
    boxes: number;
  };
  ladder?: {
    _count: {
      ladderPlayers: number;
    };
  } | null;
}

interface Club {
  slug: string;
}

interface SeasonCardProps {
  season: Season;
  club: Club;
  status: "active" | "upcoming" | "past";
}

const sportIcons = {
  TENNIS: "🎾",
  PICKLEBALL: "🏓",
  PADEL: "🎾",
  SQUASH: "🎾",
};

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  upcoming: "bg-blue-100 text-blue-800 border-blue-200",
  past: "bg-gray-100 text-gray-800 border-gray-200",
};

export function SeasonCard({ season, club, status }: SeasonCardProps) {
  const playerCount =
    season.type === "LADDER"
      ? season.ladder?._count.ladderPlayers || 0
      : season._count.boxes * 4; // Approximate players in boxes

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatPrice = (cents: number | null) => {
    if (!cents) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <Link
      href={`/clubs/${club.slug}/seasons/${season.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sportIcons[season.sport]}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{season.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {season.sport.toLowerCase()} • {season.type.toLowerCase()}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}
          >
            {status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Players:</span>
            <span className="font-medium">{playerCount}</span>
          </div>

          {season.type === "BOX" && (
            <div className="flex items-center justify-between">
              <span>Boxes:</span>
              <span className="font-medium">{season._count.boxes}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Entry fee:</span>
            <span className="font-medium">
              {formatPrice(season.entryFeeCents)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span>Start:</span>
              <span className="font-medium">
                {formatDate(season.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>End:</span>
              <span className="font-medium">{formatDate(season.endDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
