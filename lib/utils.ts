import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeContent(content: string): string {
  // Remove multiple spaces, newlines, and trim
  return content.replace(/\s+/g, " ").trim();
}
