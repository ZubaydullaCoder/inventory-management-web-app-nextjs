import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Normalization utility function.
 * Trims whitespace from start/end and collapses multiple spaces between words into one.
 * @param {string | null | undefined} str - The string to normalize.
 * @returns {string} The normalized string.
 */
export function normalizeName(str) {
  if (!str) return "";
  return str.trim().replace(/\s+/g, " ");
}
