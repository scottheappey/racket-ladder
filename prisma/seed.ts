import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test club
  const club = await prisma.club.create({
    data: {
      name: "Riverside Tennis Club",
      slug: "riverside-tennis",
      country: "United States",
      logoUrl: null,
    },
  });

  console.log("✅ Created club:", club.name);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "admin@riverside.com",
      name: "Club Admin",
      role: "ADMIN",
    },
  });

  // Make user a club admin
  await prisma.clubAdmin.create({
    data: {
      clubId: club.id,
      userId: user.id,
    },
  });

  // Create some test players
  const players = await Promise.all([
    prisma.player.create({
      data: {
        clubId: club.id,
        userId: user.id,
        name: "John Smith",
        email: "john@example.com",
        rating: 1200,
      },
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        rating: 1150,
      },
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: "Mike Wilson",
        email: "mike@example.com",
        rating: 1300,
      },
    }),
    prisma.player.create({
      data: {
        clubId: club.id,
        name: "Emma Davis",
        email: "emma@example.com",
        rating: 1250,
      },
    }),
  ]);

  console.log("✅ Created players:", players.map((p) => p.name).join(", "));

  // Create an active ladder season
  const ladderSeason = await prisma.season.create({
    data: {
      clubId: club.id,
      name: "Spring 2025 Ladder",
      sport: "TENNIS",
      type: "LADDER",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-06-01"),
      entryFeeCents: 2500,
      isActive: true,
    },
  });

  // Create the ladder
  const ladder = await prisma.ladder.create({
    data: {
      seasonId: ladderSeason.id,
      algorithm: "ELO",
    },
  });

  // Add players to ladder
  await Promise.all(
    players.map((player) =>
      prisma.ladderPlayer.create({
        data: {
          ladderId: ladder.id,
          playerId: player.id,
          rating: player.rating || 1200,
        },
      }),
    ),
  );

  console.log("✅ Created ladder season:", ladderSeason.name);

  // Create a box season
  const boxSeason = await prisma.season.create({
    data: {
      clubId: club.id,
      name: "Spring 2025 Box League",
      sport: "TENNIS",
      type: "BOX",
      startDate: new Date("2025-03-15"),
      endDate: new Date("2025-05-15"),
      entryFeeCents: 3000,
      isActive: true,
    },
  });

  // Create boxes
  const box1 = await prisma.box.create({
    data: {
      seasonId: boxSeason.id,
      name: "Division 1",
      order: 1,
    },
  });

  const box2 = await prisma.box.create({
    data: {
      seasonId: boxSeason.id,
      name: "Division 2",
      order: 2,
    },
  });

  // Add players to boxes
  await prisma.boxPlayer.create({
    data: {
      boxId: box1.id,
      playerId: players[2].id, // Mike (highest rated)
      seed: 1,
    },
  });

  await prisma.boxPlayer.create({
    data: {
      boxId: box1.id,
      playerId: players[3].id, // Emma
      seed: 2,
    },
  });

  await prisma.boxPlayer.create({
    data: {
      boxId: box2.id,
      playerId: players[0].id, // John
      seed: 1,
    },
  });

  await prisma.boxPlayer.create({
    data: {
      boxId: box2.id,
      playerId: players[1].id, // Sarah
      seed: 2,
    },
  });

  console.log("✅ Created box season with divisions");

  // Create some sample matches
  const match = await prisma.match.create({
    data: {
      seasonId: ladderSeason.id,
      ladderId: ladder.id,
      playerAId: players[0].id,
      playerBId: players[1].id,
      status: "PLAYED",
    },
  });

  // Add a result
  await prisma.result.create({
    data: {
      matchId: match.id,
      winnerId: players[0].id,
      setsJson: JSON.stringify([
        { playerAScore: 6, playerBScore: 4 },
        { playerAScore: 6, playerBScore: 2 },
      ]),
      reportedByPlayerId: players[0].id,
    },
  });

  console.log("✅ Created sample match with result");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📱 Test the app at:");
  console.log(`   Home: http://localhost:3000`);
  console.log(`   Club: http://localhost:3000/clubs/riverside-tennis`);
  console.log(
    `   Ladder: http://localhost:3000/clubs/riverside-tennis/seasons/${ladderSeason.id}`,
  );
  console.log(
    `   Box League: http://localhost:3000/clubs/riverside-tennis/seasons/${boxSeason.id}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
