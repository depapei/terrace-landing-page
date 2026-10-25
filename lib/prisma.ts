import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Each serverless instance holds its own pool; keep it small so many instances
// fit within the database's connection limit.
const POOL_SIZE = 5;

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: POOL_SIZE });
  return new PrismaClient({ adapter });
}

// Reused across hot reloads in dev and across bundles sharing one process in production.
export const prisma = globalForPrisma.prisma ?? createClient();
globalForPrisma.prisma = prisma;
