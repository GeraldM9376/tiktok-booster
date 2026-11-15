// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a realistic human face URL based on a seed (like a username or ID).
 */
export function getHumanAvatar(seed: string, gender?: "men" | "women"): string {
  // Simple hash function to get a consistent number from a string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 99;
  
  // If gender is not specified, pick based on hash
  const resolvedGender = gender || (Math.abs(hash) % 2 === 0 ? "men" : "women");
  
  return `https://randomuser.me/api/portraits/${resolvedGender}/${index}.jpg`;
}

/**
 * Checks if the image is a cartoon, and if so, returns a real human face.
 */
export function resolveAvatar(url: string | null | undefined, seed: string): string {
  if (!url || url.includes("dicebear")) {
    return getHumanAvatar(seed);
  }
  return url;
}