import { prisma } from "@/lib/prisma";
import type { NetworkSourceType } from "@/generated/prisma/client";

export async function getOrCreateSource(
  userId: string,
  name: string,
  type: NetworkSourceType
) {
  const existing = await prisma.networkSource.findFirst({
    where: { userId, name },
  });
  if (existing) return existing;

  return prisma.networkSource.create({
    data: {
      userId,
      type,
      name,
      description: `Imported via ${name}.`,
    },
  });
}
