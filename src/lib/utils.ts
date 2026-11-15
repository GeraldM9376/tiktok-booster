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
  if (!seed) return "Creator";
  const hash = hashString(seed);
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(hash >> 4) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

export function getRealUsername(seed: string, fallback: string): string {
  if (!seed) return "user";
  const hash = hashString(seed);
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length].toLowerCase();
  const lastName = LAST_NAMES[(hash >> 4) % LAST_NAMES.length].toLowerCase();
  
  // The fix is here: ensure fallback is a string before calling toLowerCase
  const safeFallback = (fallback || "user").toLowerCase();
  
  // Return the generated name, or the safe fallback if needed
  return `${firstName}_${lastName}`;
}

export function getHumanAvatar(seed: string, gender?: "men" | "women"): string {
  if (!seed) seed = "fallback";
  const hash = hashString(seed);
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