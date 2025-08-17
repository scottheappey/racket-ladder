import { db } from "@/lib/db";
import Link from "next/link";

type Club = {
  id: string;
  name: string;
  slug: string;
  country: string;
  description?: string | null;
  _count: {
    seasons: number;
    players: number;
  };
};

export default async function ClubsPage() {
  // Get all clubs
  let clubs: Club[] = [];
  try {
    clubs = await db.club.findMany({
      include: {
        _count: {
          select: {
            seasons: true,
            players: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch clubs:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tennis Clubs</h1>
      
      {clubs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No clubs available at the moment.</p>
          <p className="text-sm text-gray-500">
            Clubs will appear here once they register with the platform.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{club.name}</h3>
              <p className="text-gray-600 mb-4">{club.country}</p>
              
              <div className="flex justify-between text-sm text-gray-500">
                <span>{club._count.seasons} seasons</span>
                <span>{club._count.players} players</span>
              </div>
              
              {club.description && (
                <p className="text-gray-700 mt-3 text-sm line-clamp-2">
                  {club.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
