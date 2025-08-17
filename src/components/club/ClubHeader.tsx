import Image from "next/image";

interface Club {
  id: string;
  name: string;
  slug: string;
  country: string;
  logoUrl: string | null;
  createdAt: Date;
}

interface ClubHeaderProps {
  club: Club;
}

export function ClubHeader({ club }: ClubHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-6">
          {club.logoUrl && (
            <div className="flex-shrink-0">
              <Image
                src={club.logoUrl}
                alt={`${club.name} logo`}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {club.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{club.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
