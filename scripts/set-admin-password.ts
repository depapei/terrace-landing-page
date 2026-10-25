/**
 * Creates or rotates an admin password and revokes that admin's sessions.
 *
 *   ADMIN_NEW_PASSWORD='a-long-unique-passphrase' bun run admin:password -- admin
 *
 * The password is read from the environment so it never appears in shell history
 * arguments or logs.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../lib/auth/password";

async function main() {
  const username = process.argv[2]?.trim();
  const password = process.env.ADMIN_NEW_PASSWORD;
  if (!username) throw new Error("Usage: bun run admin:password -- <username>");
  if (!/^[A-Za-z0-9._-]{3,64}$/.test(username)) throw new Error("Invalid username");
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Set ADMIN_NEW_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters)`);
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const passwordHash = await hashPassword(password);
    const admin = await prisma.admin.upsert({
      where: { username },
      create: { username, passwordHash },
      update: { passwordHash },
      select: { id: true },
    });
    const { count } = await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });
    console.log(`✓ password set for "${username}"; ${count} session(s) revoked`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
