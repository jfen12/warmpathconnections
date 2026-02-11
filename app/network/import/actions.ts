"use server";

import { parse } from "csv-parse/sync";
import { getServerSession } from "@/lib/auth";
import { getOrCreateSource } from "@/lib/network-sources";
import { prisma } from "@/lib/prisma";
import {
  dedupeKey,
  normalizeCompany,
} from "@/lib/import-utils";
import { redirect } from "next/navigation";

type CsvRow = { name: string; company: string; role: string };

function parseCsvFile(buffer: Buffer): CsvRow[] {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows: CsvRow[] = [];
  for (const record of records) {
    const name =
      (record.name ?? record.Name ?? record["Full Name"] ?? record["full name"] ?? record.fullname ?? "").trim();
    const company =
      (record.company ?? record.Company ?? record.organization ?? record.Organization ?? "").trim();
    const role =
      (record.role ?? record.Role ?? record.title ?? record.Title ?? "").trim();

    if (!name || !company || !role) continue;
    rows.push({ name, company, role });
  }
  return rows;
}

export async function importFromCsv(formData: FormData): Promise<{
  added: number;
  skipped: number;
  error?: string;
}> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }
  const userId = (session.user as { id: string }).id;

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { added: 0, skipped: 0, error: "Please select a CSV file." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: CsvRow[];
  try {
    rows = parseCsvFile(buffer);
  } catch {
    return { added: 0, skipped: 0, error: "Invalid CSV format." };
  }

  if (rows.length === 0) {
    return { added: 0, skipped: 0, error: "No valid rows (need name, company, role)." };
  }

  const source = await getOrCreateSource(userId, "CSV Import", "IMPORT");

  const existingContacts = await prisma.personalContact.findMany({
    where: { ownerId: userId },
    select: { fullName: true, company: true },
  });
  const existingKeys = new Set(
    existingContacts.map((c) =>
      dedupeKey(c.fullName, c.company ?? "")
    )
  );

  let added = 0;
  let skipped = 0;

  for (const row of rows) {
    const key = dedupeKey(row.name, row.company);
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    const companyNormalized = normalizeCompany(row.company);
    await prisma.personalContact.create({
      data: {
        ownerId: userId,
        sourceId: source.id,
        fullName: row.name.trim(),
        company: companyNormalized,
        role: row.role.trim(),
      },
    });
    existingKeys.add(key);
    added++;
  }

  return { added, skipped };
}

export async function deleteContact(contactId: string): Promise<{ error?: string }> {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }
  const userId = (session.user as { id: string }).id;

  const contact = await prisma.personalContact.findFirst({
    where: { id: contactId, ownerId: userId },
  });
  if (!contact) {
    return { error: "Contact not found or you do not own it." };
  }

  await prisma.personalContact.delete({
    where: { id: contactId },
  });
  return {};
}
