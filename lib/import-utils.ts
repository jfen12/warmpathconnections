/**
 * Simple string normalization for company names and deduplication keys.
 * Trim, lowercase, collapse multiple spaces to one.
 */
export function normalizeString(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Normalize company name for display/storage (keeps casing for display if needed).
 * For consistency we normalize to trimmed, single-space; we can optionally lowercase for storage.
 */
export function normalizeCompany(company: string): string {
  return company
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Deduplication key: normalized name + normalized company.
 * Used to detect duplicates when importing.
 */
export function dedupeKey(name: string, company: string): string {
  return `${normalizeString(name)}|${normalizeString(company)}`;
}
