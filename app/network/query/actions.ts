"use server";

import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreAndRank, type ScoredContact } from "@/lib/query-network";
import { redirect } from "next/navigation";

/**
 * Run a network query over the current user's contacts only.
 * Does not share any data; results are for the user's own view.
 */
export async function runNetworkQuery(filters: {
  company?: string;
  role?: string;
  keyword?: string;
}): Promise<{ results: ScoredContact[]; error?: string }> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const userId = (session.user as { id: string }).id;
  const company = filters.company?.trim();
  const role = filters.role?.trim();
  const keyword = filters.keyword?.trim();

  if (!company && !role && !keyword) {
    return { results: [], error: "Enter at least one filter (company, role, or keyword)." };
  }

  const contacts = await prisma.personalContact.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      fullName: true,
      company: true,
      role: true,
      notes: true,
      relationshipStrength: true,
    },
  });

  const forScoring = contacts.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    company: c.company,
    role: c.role,
    notes: c.notes,
    relationshipStrength: c.relationshipStrength,
  }));

  const results = scoreAndRank(forScoring, {
    company: company || undefined,
    role: role || undefined,
    keyword: keyword || undefined,
  });

  return { results };
}
