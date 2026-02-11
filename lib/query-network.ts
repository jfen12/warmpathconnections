import { normalizeString } from "./import-utils";

export type ContactForScoring = {
  id: string;
  fullName: string;
  company: string | null;
  role: string | null;
  notes: string | null;
  relationshipStrength: number | null;
};

export type ScoredContact = ContactForScoring & {
  score: number;
  whyMatch: string[];
};

/**
 * Score and rank contacts for a network query.
 * Only uses the contact data provided (already scoped to the user).
 * No sharing; this is a local ranking over the user's own contacts.
 */
export function scoreAndRank(
  contacts: ContactForScoring[],
  filters: {
    company?: string;
    role?: string;
    keyword?: string;
  }
): ScoredContact[] {
  const companyNorm = filters.company ? normalizeString(filters.company) : "";
  const roleNorm = filters.role ? normalizeString(filters.role) : "";
  const keywordNorm = filters.keyword ? normalizeString(filters.keyword) : "";

  const scored: ScoredContact[] = contacts.map((c) => {
    const whyMatch: string[] = [];
    let score = 0;

    if (companyNorm) {
      const contactCompanyNorm = c.company ? normalizeString(c.company) : "";
      if (contactCompanyNorm === companyNorm) {
        score += 3;
        whyMatch.push(`Exact company match (${c.company ?? ""}).`);
      } else if (contactCompanyNorm.includes(companyNorm) || companyNorm.includes(contactCompanyNorm)) {
        score += 1;
        whyMatch.push(`Company related to "${filters.company}".`);
      }
    }

    if (roleNorm && c.role) {
      const contactRoleNorm = normalizeString(c.role);
      if (contactRoleNorm === roleNorm) {
        score += 2;
        whyMatch.push(`Role matches (${c.role}).`);
      } else if (contactRoleNorm.includes(roleNorm) || roleNorm.includes(contactRoleNorm)) {
        score += 1;
        whyMatch.push(`Role relevant to "${filters.role}".`);
      }
    }

    if (keywordNorm) {
      const fields = [
        c.fullName,
        c.company ?? "",
        c.role ?? "",
        c.notes ?? "",
      ].map((s) => normalizeString(s));
      const matchesKeyword = fields.some((f) => f.includes(keywordNorm));
      if (matchesKeyword) {
        score += 1;
        whyMatch.push(`Keyword "${filters.keyword}" found in profile.`);
      }
    }

    if (c.relationshipStrength != null && c.relationshipStrength >= 1 && c.relationshipStrength <= 5) {
      score += c.relationshipStrength * 0.4;
      whyMatch.push(`Strong relationship (${c.relationshipStrength}/5).`);
    }

    return {
      ...c,
      score,
      whyMatch,
    };
  });

  const withPositiveScore = scored.filter((s) => s.score > 0);
  withPositiveScore.sort((a, b) => b.score - a.score);
  return withPositiveScore.slice(0, 10);
}
