import { Sport, SeasonType } from "@prisma/client";

interface Season {
  id: string;
  name: string;
  sport: Sport;
  type: SeasonType;
  startDate: Date;
  endDate: Date;
  entryFeeCents: number | null;
  isActive: boolean;
  club: {
    name: string;
    slug: string;
  };
}

interface SeasonHeaderProps {
  season: Season;
}

const sportIcons = {
  TENNIS: "🎾",
  PICKLEBALL: "🏓",
  PADEL: "🎾",
  SQUASH: "🎾",
};

export function SeasonHeader({ season }: SeasonHeaderProps) {
  const formatDateRange = (start: Date, end: Date) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  };

  const formatPrice = (cents: number | null) => {
    if (!cents) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getStatusBadge = () => {
    const now = new Date();
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);

    if (now < start) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          Upcoming
        </span>
      );
    } else if (now > end) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
          Finished
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
          Active
        </span>
      );
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{sportIcons[season.sport]}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {season.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="capitalize font-medium">
                  {season.sport.toLowerCase()} {season.type.toLowerCase()}
                </span>
                <span>•</span>
                <span>{formatDateRange(season.startDate, season.endDate)}</span>
                <span>•</span>
                <span>{formatPrice(season.entryFeeCents)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">{getStatusBadge()}</div>
        </div>
      </div>
    </header>
  );
}
