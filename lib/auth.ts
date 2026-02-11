import type { NextAuthOptions } from "next-auth";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

export async function getServerSession() {
  return getNextAuthServerSession(authOptions);
}

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NextAuth adapter types expect node_modules PrismaClient; we use generated client
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        (session.user as { id: string }).id = user.id;
      }
      return session;
    },
    redirect({ baseUrl }) {
      return `${baseUrl}/network`;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
};

