import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ClubHeader } from "@/components/club/ClubHeader";
import { SeasonCard } from "@/components/club/SeasonCard";

interface ClubPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params;

  const club = await db.club.findUnique({
    where: { slug },
    include: {
      seasons: {
        orderBy: { startDate: "desc" },
        include: {
          _count: {
            select: {
              boxes: true,
            },
          },
          ladder: {
            include: {
              _count: {
                select: {
                  ladderPlayers: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!club) {
    notFound();
  }

  const activeSeasons = club.seasons.filter(
    (season) =>
      new Date() >= new Date(season.startDate) &&
      new Date() <= new Date(season.endDate),
  );

  const upcomingSeasons = club.seasons.filter(
    (season) => new Date() < new Date(season.startDate),
  );

  const pastSeasons = club.seasons.filter(
    (season) => new Date() > new Date(season.endDate),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ClubHeader club={club} />

      <main className="container mx-auto px-4 py-8">
        {/* Active Seasons */}
        {activeSeasons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Active Seasons
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeSeasons.map((season) => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  club={club}
                  status="active"
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Seasons */}
        {upcomingSeasons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Seasons
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSeasons.map((season) => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  club={club}
                  status="upcoming"
                />
              ))}
            </div>
          </section>
        )}

        {/* Past Seasons */}
        {pastSeasons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Past Seasons
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastSeasons.slice(0, 6).map((season) => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  club={club}
                  status="past"
                />
              ))}
            </div>
            {pastSeasons.length > 6 && (
              <div className="mt-6 text-center">
                <Link
                  href={`/clubs/${club.slug}/seasons`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all past seasons →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {club.seasons.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m-6-6l6-6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No seasons yet
              </h3>
              <p className="text-gray-600">
                This club hasn&apos;t created any seasons yet. Check back soon!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: ClubPageProps) {
  const { slug } = await params;

  const club = await db.club.findUnique({
    where: { slug },
    select: { name: true, country: true },
  });

  if (!club) {
    return {
      title: "Club Not Found",
    };
  }

  return {
    title: `${club.name} - Racket Ladders`,
    description: `Join ladder and box league competitions at ${club.name} in ${club.country}. View active seasons and register to play.`,
    openGraph: {
      title: `${club.name} - Racket Ladders`,
      description: `Join ladder and box league competitions at ${club.name} in ${club.country}`,
      type: "website",
    },
  };
}
