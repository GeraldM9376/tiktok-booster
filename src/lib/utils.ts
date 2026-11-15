// src/lib/utils.ts
export { cn } from "cn";

const FIRST_NAMES = [
  "Sarah", "Marcus", "Elena", "David", "Aisha", "James", "Mia", "Carlos", 
  "Chloe", "Kwame", "Yuki", "Liam", "Fatima", "Noah", "Zara", "Ethan", 
  "Priya", "Lucas", "Nia", "Omar", "Sofia", "Tariq", "Amara", "Leo", 
  "Isabella", "Mateo", "Aaliyah", "Hiro", "Emma", "Malik", "Ruby", "Jin"
];

const LAST_NAMES = [
  "Jenkins", "Chen", "Rodriguez", "Patel", "Johnson", "Kim", "Okafor", 
  "Silva", "Nguyen", "Smith", "Müller", "Ali", "Garcia", "Kowalski", 
  "Tanaka", "Brown", "Diallo", "Martinez", "Singh", "Wilson", "Hassan",
  "Lopez", "Park", "Taylor", "Mensah", "Andersson", "Rossi", "Davis"
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getRealName(seed: string): string {
  const safeSeed = seed || "unknown";
  const hash = hashString(safeSeed);
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(hash >> 4) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

export function getRealUsername(seed: string, fallback: any): string {
  // Catch every possible way fallback could be empty
  if (typeof fallback !== "string" || !fallback) {
    const safeSeed = seed || "unknown";
    const hash = hashString(safeSeed);
    const firstName = FIRST_NAMES[hash % FIRST_NAMES.length].toLowerCase();
    const lastName = LAST_NAMES[(hash >> 4) % LAST_NAMES.length].toLowerCase();
    return `${firstName}_${lastName}`;
  }
  
  // It is a valid string, so toLowerCase is safe
  return fallback.toLowerCase();
}

export function getHumanAvatar(seed: string, gender?: "men" | "women"): string {
  const safeSeed = seed || "unknown";
  const hash = hashString(safeSeed);
  const index = hash % 99;
  const resolvedGender = gender || (hash % 2 === 0 ? "men" : "women");
  return `https://randomuser.me/api/portraits/${resolvedGender}/${index}.jpg`;
}

export function resolveAvatar(url: string | null | undefined, seed: string): string {
  if (!url || url.includes("dicebear")) {
    return getHumanAvatar(seed);
  }
  return url;
}