import cuid from "cuid";

// Sanitize content by removing excessive whitespace and trimming
export function sanitizeContent(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}
