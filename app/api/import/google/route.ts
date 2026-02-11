import { getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const SCOPE = "https://www.googleapis.com/auth/contacts.readonly";
const BASE = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/api/auth/signin", process.env.NEXTAUTH_URL));
  }

  const clientId = process.env.GOOGLE_IMPORT_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_IMPORT_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/network/import?error=google_not_configured", process.env.NEXTAUTH_URL ?? "http://localhost:3000")
    );
  }

  const userId = (session.user as { id: string }).id;
  const state = Buffer.from(JSON.stringify({ userId })).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `${BASE}?${params.toString()}`;
  return NextResponse.redirect(url);
}
