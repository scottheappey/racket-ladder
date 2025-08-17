import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { SeasonHeader } from "@/components/season/SeasonHeader";
// Make sure this path matches the actual file location and filename (case-sensitive)
import { LadderView } from "@/components/season/LadderView";
import { BoxView } from "@/components/season/BoxView";

interface SeasonPageProps {
  params: Promise<{
    slug: string;
    seasonId: string;
  }>;
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { slug, seasonId } = await params;

  const season = await db.season.findFirst({
    where: {
      id: seasonId,
      club: { slug },
    },
    include: {
      club: true,
      ladder: {
        include: {
          ladderPlayers: {
            include: {
              player: true,
            },
            orderBy: {
              rating: "desc", // Order by rating since there's no position field
            },
          },
        },
      },
      boxes: {
        include: {
          boxPlayers: {
            include: {
              player: true,
            },
            orderBy: {
              seed: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      matches: {
        include: {
          playerA: true,
          playerB: true,
          result: {
            include: {
              winner: true,
              reportedByPlayer: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "desc",
        },
      },
    },
  });

  if (!season) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SeasonHeader season={season} />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link
                href={`/clubs/${season.club.slug}`}
                className="hover:text-gray-900"
              >
                {season.club.name}
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900">{season.name}</span>
            </li>
          </ol>
        </nav>

        {/* Season Content */}
        {season.type === "LADDER" && season.ladder && (
          <LadderView ladder={season.ladder} matches={season.matches} />
        )}

        {season.type === "BOX" && (
          <BoxView boxes={season.boxes} matches={season.matches} />
        )}
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: SeasonPageProps) {
  const { slug, seasonId } = await params;

  const season = await db.season.findFirst({
    where: {
      id: seasonId,
      club: { slug },
    },
    include: {
      club: {
        select: { name: true },
      },
    },
  });

  if (!season) {
    return {
      title: "Season Not Found",
    };
  }

  return {
    title: `${season.name} - ${season.club.name} - Racket Ladders`,
    description: `View standings, matches and results for ${season.name} at ${season.club.name}. ${season.sport} ${season.type.toLowerCase()} league.`,
    openGraph: {
      title: `${season.name} - ${season.club.name}`,
      description: `${season.sport} ${season.type.toLowerCase()} league standings and results`,
      type: "website",
    },
  };
}
