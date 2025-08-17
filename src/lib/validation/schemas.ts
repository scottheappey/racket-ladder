import { z } from "zod";

export const clubSchema = z.object({
  name: z.string().min(1, "Club name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  country: z.string().min(1, "Country is required").max(50),
  logoUrl: z.string().url().optional(),
});

export const seasonSchema = z.object({
  name: z.string().min(1, "Season name is required").max(100),
  sport: z.enum(["TENNIS", "PICKLEBALL", "PADEL", "SQUASH"]),
  type: z.enum(["LADDER", "BOX"]),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
  entryFeeCents: z.number().int().min(0).optional(),
});

export const playerSchema = z.object({
  name: z.string().min(1, "Player name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  rating: z.number().min(0).max(3000).optional(),
});

export const matchResultSchema = z.object({
  winnerId: z.string().min(1, "Winner is required"),
  sets: z
    .array(
      z.object({
        playerAScore: z.number().int().min(0).max(20),
        playerBScore: z.number().int().min(0).max(20),
      }),
    )
    .min(1, "At least one set is required")
    .max(5, "Maximum 5 sets allowed"),
});

export const csvImportSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a CSV file" })
    .refine(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv"),
      "File must be a CSV",
    ),
});
