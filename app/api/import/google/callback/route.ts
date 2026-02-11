import { getServerSession } from "@/lib/auth";
import { getOrCreateSource } from "@/lib/network-sources";
import { prisma } from "@/lib/prisma";
import { dedupeKey, normalizeCompany } from "@/lib/import-utils";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const PEOPLE_SCOPE = "https://www.googleapis.com/auth/contacts.readonly";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const redirectNetwork = (imported?: number) => {
    const url = new URL("/network", baseUrl);
    if (imported !== undefined) url.searchParams.set("imported", String(imported));
    return NextResponse.redirect(url);
  };

  if (error) {
    return redirectNetwork();
  }

  if (!code || !state) {
    return redirectNetwork();
  }

  const session = await getServerSession();
  if (!session?.user) {
    return redirectNetwork();
  }
  const currentUserId = (session.user as { id: string }).id;

  let userId: string;
  try {
    const decoded = JSON.parse(
      Buffer.from(state, "base64url").toString("utf8")
    ) as { userId?: string };
    if (!decoded.userId) throw new Error("Missing userId");
    userId = decoded.userId;
    if (userId !== currentUserId) {
      return redirectNetwork();
    }
  } catch {
    return redirectNetwork();
  }

  const clientId = process.env.GOOGLE_IMPORT_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_IMPORT_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_IMPORT_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return redirectNetwork();
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  let tokens;
  try {
    const { tokens: t } = await oauth2Client.getToken(code);
    tokens = t;
  } catch {
    return redirectNetwork();
  }

  if (!tokens.access_token) {
    return redirectNetwork();
  }

  oauth2Client.setCredentials(tokens);

  const people = google.people({ version: "v1", auth: oauth2Client });

  let connections: Array<{
    names?: Array<{ displayName?: string | null }>;
    emailAddresses?: Array<{ value?: string | null }>;
    organizations?: Array<{ name?: string | null; title?: string | null }>;
  }>;
  try {
    const res = await people.people.connections.list({
      resourceName: "people/me",
      pageSize: 1000,
      personFields: "names,emailAddresses,organizations",
    });
    connections = (res.data.connections ?? []) as typeof connections;
  } catch {
    return redirectNetwork();
  }

  const source = await getOrCreateSource(userId, "Google", "EMAIL");

  const existingContacts = await prisma.personalContact.findMany({
    where: { ownerId: userId },
    select: { fullName: true, company: true },
  });
  const existingKeys = new Set(
    existingContacts.map((c) => dedupeKey(c.fullName, c.company ?? ""))
  );

  let added = 0;

  for (const person of connections) {
    const name = person.names?.[0]?.displayName?.trim();
    if (!name) continue;

    const org = person.organizations?.[0];
    const company = org?.name?.trim() ?? "";
    const role = org?.title?.trim() ?? "";
    const email = person.emailAddresses?.[0]?.value?.trim() ?? null;

    const key = dedupeKey(name, company);
    if (existingKeys.has(key)) continue;

    const companyNormalized = company ? normalizeCompany(company) : null;

    await prisma.personalContact.create({
      data: {
        ownerId: userId,
        sourceId: source.id,
        fullName: name,
        company: companyNormalized,
        role: role || null,
        email,
      },
    });
    existingKeys.add(key);
    added++;
  }

  return redirectNetwork(added);
}
