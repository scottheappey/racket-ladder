import Link from "next/link";
import { db } from "@/lib/db";

type Club = {
  id: string;
  name: string;
  slug: string;
  country: string;
  _count: {
    seasons: number;
    players: number;
  };
};

export default async function HomePage() {
  // Get some featured clubs for the homepage (handle gracefully if DB unavailable)
  let clubs: Club[] = [];
  try {
    clubs = await db.club.findMany({
      take: 6,
      include: {
        _count: {
          select: {
            seasons: true,
            players: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch {
    console.log("Database not available, showing empty clubs list");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎾</span>
              <h1 className="text-2xl font-bold text-gray-900">
                Racket Ladders
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </Link>
              <Link
                href="/signup/club-admin"
                className="text-gray-600 hover:text-gray-900"
              >
                Start a Club
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Modern Ladder Competitions
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            The 1% better platform for racket sports leagues with WhatsApp
            flows, magic join links, and delightful public pages
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/clubs"
              className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
            >
              Find Clubs
            </Link>
            <Link
              href="/signup/club-admin"
              className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              Start Your Club
            </Link>
            <Link
              href="/admin"
              className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Racket Ladders?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">
                WhatsApp Integration
              </h3>
              <p className="text-gray-600">
                Match notifications and updates delivered via WhatsApp for
                seamless communication
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Magic Join Links</h3>
              <p className="text-gray-600">
                Share a simple link for instant player registration and league
                joining
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">
                Beautiful Public Pages
              </h3>
              <p className="text-gray-600">
                SEO-optimized pages with social sharing that showcase your
                league professionally
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs */}
      {clubs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Featured Clubs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.slug}`}
                  className="block bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {club.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{club.country}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{club._count.seasons} seasons</span>
                    <span>{club._count.players} players</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl">🎾</span>
            <span className="font-bold">Racket Ladders</span>
          </div>
          <p className="text-gray-400">
            The modern platform for racket sports competitions
          </p>
        </div>
      </footer>
    </div>
  );
}
