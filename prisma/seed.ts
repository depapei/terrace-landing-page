/**
 * Idempotent seed: safe to run any number of times.
 * - Ensures the default admin exists (never overwrites a rotated password
 *   unless SEED_ADMIN_RESET_PASSWORD=true).
 * - Ensures the two default solution packages exist (admin edits are kept).
 * Partners, achievements and hero slides are intentionally not seeded.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../lib/auth/password";

const DEFAULT_ADMIN_USERNAME = "admin";
// Initial credential required by the project brief. Rotate it after first login
// (see README "Admin accounts"), or override with SEED_ADMIN_PASSWORD.
const DEFAULT_ADMIN_PASSWORD = "t#rrace@2026";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`SEED_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  const reset = process.env.SEED_ADMIN_RESET_PASSWORD === "true";
  const passwordHash = await hashPassword(password);

  const existing = await prisma.admin.findUnique({ where: { username }, select: { id: true } });
  await prisma.admin.upsert({
    where: { username },
    create: { username, passwordHash },
    update: reset ? { passwordHash } : {},
  });
  if (existing && reset) await prisma.adminSession.deleteMany({ where: { adminId: existing.id } });

  console.log(
    existing
      ? `✓ admin "${username}" already exists${reset ? " (password reset, sessions revoked)" : " (unchanged)"}`
      : `✓ admin "${username}" created`,
  );
}

// Default/draft content taken from the approved mockup. Features are editable in
// the CMS and must be reviewed before launch (doc/DESIGN.md §9, §17).
const DEFAULT_SOLUTIONS = [
  {
    slug: "landing-page",
    name: "Landing Page",
    label: "Paket 01 / Website",
    badge: null,
    description:
      "Website profesional untuk memperkenalkan bisnis, menampilkan layanan, dan membantu calon pelanggan menghubungi Anda.",
    pricingType: "FIXED_RANGE" as const,
    priceMin: 500000,
    priceMax: 1500000,
    pricingLabel: "Rp500 ribu – Rp1,5 juta",
    pricingNote: null,
    features: [
      "Desain responsif untuk mobile dan desktop",
      "Struktur konten sesuai identitas bisnis",
      "CTA dan integrasi kontak",
      "Optimasi dasar SEO dan performa",
    ],
    ctaLabel: "Pilih paket",
    ctaUrl: "#kontak",
    isFeatured: false,
    sortOrder: 0,
  },
  {
    slug: "complex-management-system",
    name: "Complex Management System",
    label: "Paket 02 / Custom system",
    badge: "By consultation",
    description:
      "Sistem khusus untuk operasional bisnis, pengelolaan gudang, inventori, workflow, dashboard, dan kebutuhan integrasi.",
    pricingType: "CONSULTATION" as const,
    priceMin: null,
    priceMax: null,
    pricingLabel: "Wajib konsultasi, harga dinamis",
    pricingNote: null,
    features: [
      "Konsultasi dan analisis kebutuhan wajib",
      "Rancangan fitur sesuai alur bisnis",
      "Pengelolaan data dan hak akses",
      "Estimasi biaya berdasarkan kompleksitas",
    ],
    ctaLabel: "Jadwalkan konsultasi",
    ctaUrl: "#kontak",
    isFeatured: true,
    sortOrder: 1,
  },
];

async function seedSolutions() {
  for (const solution of DEFAULT_SOLUTIONS) {
    await prisma.solutionPackage.upsert({
      where: { slug: solution.slug },
      create: solution,
      update: {},
    });
  }
  console.log(`✓ ${DEFAULT_SOLUTIONS.length} default solution packages ensured`);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  await seedAdmin();
  await seedSolutions();
}

main()
  .catch((error) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
