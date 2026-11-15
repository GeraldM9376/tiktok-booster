// src/lib/utils.ts
export { cn } from "cn";

// A list of realistic first names (diverse)
const FIRST_NAMES = [
  "Sarah", "Marcus", "Elena", "David", "Aisha", "James", "Mia", "Carlos", 
  "Chloe", "Kwame", "Yuki", "Liam", "Fatima", "Noah", "Zara", "Ethan", 
  "Priya", "Lucas", "Nia", "Omar", "Sofia", "Tariq", "Amara", "Leo", 
  "Isabella", "Mateo", "Aaliyah", "Hiro", "Emma", "Malik", "Ruby", "Jin"
];

// A list of realistic last names (diverse)
const LAST_NAMES = [
  "Jenkins", "Chen", "Rodriguez", "Patel", "Johnson", "Kim", "Okafor", 
  "Silva", "Nguyen", "Smith", "Müller", "Ali", "Garcia", "Kowalski", 
  "Tanaka", "Brown", "Diallo", "Martinez", "Singh", "Wilson", "Hassan",
  "Lopez", "Park", "Taylor", "Mensah", "Andersson", "Rossi", "Davis"
];

// Helper to generate a consistent number based on a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Generates a realistic human name based on a seed (like their UUID).
 */
export function getRealName(seed: string): string {
  const hash = hashString(seed);
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(hash >> 4) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

/**
 * Generates a realistic username based on the seed.
 */
export function getRealUsername(seed: string, fallback: string): string {
  const hash = hashString(seed);
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length].toLowerCase();
  const lastName = LAST_NAMES[(hash >> 4) % LAST_NAMES.length].toLowerCase();
  return `${firstName}_${lastName}`;
}

/**
 * Gets a human face image.
 */
export function getHumanAvatar(seed: string, gender?: "men" | "women"): string {
  const hash = hashString(seed);
  const index = hash % 99;
  const resolvedGender = gender || (hash % 2 === 0 ? "men" : "women");
  return `https://randomuser.me/api/portraits/${resolvedGender}/${index}.jpg`;
}

/**
 * Resolves avatar (falls back to human faces if it's a cartoon).
 */
export function resolveAvatar(url: string | null | undefined, seed: string): string {
  if (!url || url.includes("dicebear")) {
    return getHumanAvatar(seed);
  }
  return url;
}