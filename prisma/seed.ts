import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "founder@example.com" },
    update: {},
    create: {
      email: "founder@example.com",
      name: "WarmPath Founder",
    },
  });

  const manualSource = await prisma.networkSource.upsert({
    where: { id: "manual-source-" + user.id },
    update: {},
    create: {
      id: "manual-source-" + user.id,
      userId: user.id,
      type: "MANUAL",
      name: "Manual",
      description: "Contacts added directly by the user.",
    },
  });

  const linkedInSource = await prisma.networkSource.upsert({
    where: { id: "linkedin-source-" + user.id },
    update: {},
    create: {
      id: "linkedin-source-" + user.id,
      userId: user.id,
      type: "SOCIAL",
      name: "LinkedIn",
      description: "Imported from LinkedIn.",
    },
  });

  const googleSource = await prisma.networkSource.upsert({
    where: { id: "google-source-" + user.id },
    update: {},
    create: {
      id: "google-source-" + user.id,
      userId: user.id,
      type: "EMAIL",
      name: "Google",
      description: "From Google contacts.",
    },
  });

  const contacts = [
    {
      fullName: "Alice Coordinator",
      email: "alice@example.com",
      company: "Acme Inc",
      role: "Operations Lead",
      notes: "Great at keeping projects on track.",
      sourceId: manualSource.id,
    },
    {
      fullName: "Bob Connector",
      email: "bob@example.com",
      company: "Startup Hub",
      role: "Community Manager",
      notes: "Knows everyone in the local startup scene.",
      sourceId: linkedInSource.id,
    },
    {
      fullName: "Carol Investor",
      email: "carol@example.com",
      company: "Seed Ventures",
      role: "Angel Investor",
      notes: "Early-stage; prefers concise updates.",
      sourceId: linkedInSource.id,
    },
    {
      fullName: "Dan Engineer",
      email: "dan@example.com",
      company: "TechCo",
      role: "Senior Engineer",
      notes: "Ideal for technical deep dives.",
      sourceId: googleSource.id,
    },
    {
      fullName: "Eve Advisor",
      email: "eve@example.com",
      company: null,
      role: "Advisor",
      notes: "Trusted sounding board for tricky intros.",
      sourceId: manualSource.id,
    },
  ];

  for (const c of contacts) {
    await prisma.personalContact.upsert({
      where: {
        ownerId_email: { ownerId: user.id, email: c.email },
      },
      update: {
        company: c.company ?? undefined,
        role: c.role ?? undefined,
        sourceId: c.sourceId,
        notes: c.notes,
      },
      create: {
        ownerId: user.id,
        sourceId: c.sourceId,
        fullName: c.fullName,
        email: c.email,
        company: c.company ?? undefined,
        role: c.role ?? undefined,
        notes: c.notes,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
