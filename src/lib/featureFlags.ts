export function getFeatureFlag(flag: string): boolean {
  const value = process.env[flag];
  return value === "true";
}

export const FEATURE_FLAGS = {
  WHATSAPP: "FEATURE_WHATSAPP",
} as const;
