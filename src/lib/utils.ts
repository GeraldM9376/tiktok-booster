// src/lib/utils.ts
export { cn } from "cn";

export function getHumanAvatar(seed: string, gender?: "men" | "women"): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 99;
  const resolvedGender = gender || (Math.abs(hash) % 2 === 0 ? "men" : "women");
  return `https://randomuser.me/api/portraits/${resolvedGender}/${index}.jpg`;
}

export function resolveAvatar(url: string | null | undefined, seed: string): string {
  if (!url || url.includes("dicebear")) {
    return getHumanAvatar(seed);
  }
  return url;
}