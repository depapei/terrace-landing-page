# Terrace — Landing page & CMS

Landing page for **Terrace / PT. Teras Teknologi** with an admin CMS for hero slides, solution packages, portfolio ("Hasil kerja"), partners and achievement badges.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Prisma 7 + PostgreSQL · TanStack Query + Axios · React Hook Form + Zod · Sharp (WebP) · Argon2id.

Design references are in [`doc/`](doc/): [`DESIGN.md`](doc/DESIGN.md) is the design system and [`index.html`](doc/index.html) is the original static mockup.

Lead Management adds manual prospects and public inquiry submissions. The lead migration has been prepared but has not been applied by the agent; the owner must apply it before using `/admin/leads` or the public inquiry form. Handoff instructions are shared separately.

## Requirements

- [Bun](https://bun.sh) 1.4+ (package manager and script runner) and Node.js 20+
- PostgreSQL 14+

## Local setup

```bash
bun install                 # also runs `prisma generate`
cp .env.example .env        # then fill in DATABASE_URL (see below)
bun run db:migrate          # applies prisma/migrations to your database
bun run db:seed             # creates the default admin + two default packages
bun run dev                 # http://localhost:3000
```

| URL | Purpose |
|---|---|
| `/` | Public landing page |
| `/admin/login` | Admin login |
| `/admin` | Dashboard (active counts) |
| `/admin/hero`, `/admin/solutions`, `/admin/portfolio`, `/admin/partners`, `/admin/achievements` | Content management |
| `/hasil-kerja/[slug]` | Public detail page of a published portfolio item |

### Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string used by the app. On serverless use a transaction pooler (Supabase: port `6543`) |
| `DIRECT_URL` | no | Direct/session connection used by the Prisma CLI (migrate, seed, studio). Falls back to `DATABASE_URL` |
| `NEXT_PUBLIC_SITE_URL` | production | Canonical URL; used for metadata and the CSRF origin allow-list |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Verified email. Hidden on the site when empty |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | no | Digits with country code (`6281…`). Hidden when empty |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | no | Override the seeded admin credential |
| `SEED_ADMIN_RESET_PASSWORD` | no | `true` re-applies the seed password to an existing admin |
| `STORAGE_DRIVER` | no | `local` (default) or `s3` |
| `LOCAL_STORAGE_DIR` | no | Upload directory for the local driver (default `./storage/uploads`) |
| `S3_*` | when `s3` | See [Image storage](#image-storage) |

`NEXT_PUBLIC_*` values are inlined at build time, so rebuild after changing them. Contact placeholders from the mockup (`hello@terrace.tech`, `+62 800-0000-0000`) are intentionally **not** used.

## Database

- Schema: [`prisma/schema.prisma`](prisma/schema.prisma). Prisma 7 configuration (datasource URL, migrations path, seed command) lives in [`prisma.config.ts`](prisma.config.ts); it loads `.env` itself.
- `bun run db:migrate` creates/applies migrations in development (`prisma migrate dev`).
- `bun run db:deploy` applies committed migrations in production (`prisma migrate deploy`).
- `bun run db:seed` is **idempotent**: re-running it never duplicates rows and never overwrites content edited in the CMS.
- `bun run db:studio` opens Prisma Studio.

### What the seeder creates

- Admin `admin`, initial password `t#rrace@2026` (stored only as an Argon2id hash; never logged).
- **Landing Page**: fixed range Rp500.000–Rp1.500.000, label `Rp500 ribu – Rp1,5 juta`.
- **Complex Management System**: consultation-based, no prices, label `Wajib konsultasi, harga dinamis`, CTA `Jadwalkan konsultasi`.

The package descriptions and feature lists come from the mockup and are **default/draft content**: review and edit them in `/admin/solutions` before launch. No portfolio items, partners, achievements or hero slides are seeded; the landing page shows designed empty states and the original CSS artwork until real content is added.

## Admin accounts

The seeded credential is for first login only. **Rotate it before exposing the site to the internet:**

```bash
ADMIN_NEW_PASSWORD='a-long-unique-passphrase' bun run admin:password -- admin
```

This re-hashes the password (min. 12 characters) and revokes all sessions of that admin. The same command creates a new admin if the username doesn't exist. For new environments you can also set `SEED_ADMIN_PASSWORD` before the first `db:seed`.

### Auth and security model

- Passwords: Argon2id (19 MiB, t=2). Unknown usernames still run a hash verify to avoid timing leaks; login errors are generic.
- Sessions: 32-byte random token in an `HttpOnly`, `SameSite=Strict` cookie (`Secure` in production), 8 h lifetime. Only the SHA-256 of the token is stored (`AdminSession`). Logout deletes the row, so the cookie is useless afterwards.
- Authorization: [`proxy.ts`](proxy.ts) only redirects visitors without a cookie. The real check runs on the server for every admin page ([`app/admin/(protected)/layout.tsx`](app/admin/(protected)/layout.tsx)) and every `/api/admin/*` handler ([`lib/auth/require-admin.ts`](lib/auth/require-admin.ts)).
- CSRF: mutations require a matching `Origin` header and the custom `X-Terrace-Request: 1` header (set by the Axios client), on top of `SameSite=Strict`.
- Login rate limit: 5 attempts per IP+username and 30 per IP per 15 minutes. Counters live in the `LoginAttempt` table ([`lib/auth/rate-limit.ts`](lib/auth/rate-limit.ts)), so they are shared by every instance, including serverless ones.
- Input: every write is validated with Zod and mapped field-by-field to Prisma (no mass assignment). External URLs must be `http(s)`; CTA links allow `#anchor`, `/path`, `https:`, `mailto:` and `tel:` only.
- Errors returned to the browser never include stack traces or database details.

## Image storage

Uploads (hero slides, partner logos, badges, portfolio images) go through [`lib/image/process.ts`](lib/image/process.ts):

1. Client: JPEG/PNG/WebP only. The browser downscales the picked file to the folder's stored width and re-encodes it as high-quality WebP ([`lib/image/client-resize.ts`](lib/image/client-resize.ts)), then checks the **3 MiB** limit on the result and shows a preview ([`components/admin/ImageField.tsx`](components/admin/ImageField.tsx)). A whole request is capped at 4.4 MiB, below Vercel's 4.5 MB body limit; the portfolio form checks this before sending.
2. Server: session + CSRF check, `Content-Length` and file-size limit (3 MiB → `413`), MIME allow-list **and** magic-byte check, Sharp decode with a 40 MP pixel limit, EXIF-orientation fix, resize (hero 2400 px, logos 600 px, badges 400 px, portfolio 1600 px wide), WebP quality 90. The original is discarded.
3. The WebP file is stored under a generated key (`<folder>/<uuid>.webp`); Prisma stores its URL, key and dimensions.
4. If the database write fails, the new file is deleted. On replacement the old file is deleted only after the database update succeeds. Deletions use the key stored in the database, never client input. Portfolio items hold 1–3 images (`PortfolioImage` rows, first = card thumbnail); each save sends an ordered manifest of kept image ids and new uploads, applied in one database write. Removed or replaced files are deleted after that write succeeds, new files are deleted if it fails, and deleting an item deletes all its files.

Storage is abstracted behind the `ImageStorage` interface ([`lib/storage/`](lib/storage/)):

- **`local`** (default): files are written to `storage/uploads/` (git-ignored, outside `public/`) and served by [`app/media/[...key]/route.ts`](app/media/[...key]/route.ts) as `image/webp` with `nosniff` and a sandboxing CSP. Only keys matching the generated pattern are served, so nothing in that folder can be executed or traversed. **This is not persistent on serverless platforms such as Vercel** (the filesystem is ephemeral and per-instance); use it for development or a single long-lived server with a persistent disk.
- **`s3`**: any S3-compatible bucket (Supabase Storage, AWS S3, Cloudflare R2, MinIO). Set `STORAGE_DRIVER=s3`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (for non-AWS), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` (MinIO) and `S3_PUBLIC_BASE_URL` (public URL serving the bucket; images are loaded from it directly). The adapter is implemented but **has not been tested against a real bucket**; verify uploads, public reads and deletes before relying on it.

  Supabase Storage: create a **public** bucket, create S3 access keys under Storage → S3 Connection, then set

  ```env
  STORAGE_DRIVER="s3"
  S3_BUCKET="<bucket>"
  S3_REGION="<project region, e.g. ap-southeast-2>"
  S3_ENDPOINT="https://<project-ref>.storage.supabase.co/storage/v1/s3"
  S3_FORCE_PATH_STYLE="true"
  S3_ACCESS_KEY_ID="<access key id>"
  S3_SECRET_ACCESS_KEY="<secret access key>"
  S3_PUBLIC_BASE_URL="https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>"
  ```

## Content caching

The landing page reads active rows through [`lib/data/landing.ts`](lib/data/landing.ts) with `'use cache'`, `cacheLife('hours')` and one cache tag per entity. Every CMS mutation calls `revalidateTag(tag, { expire: 0 })`, so the next visit renders fresh content. If the database is unreachable the page still renders (empty states) and retries within minutes.

## Project structure

```
app/                      routes: landing page, /admin, /api, /media
components/landing/       Navbar, HeroCarousel, PartnerMarquee, SolutionsSection, AboutSection,
                          PortfolioSection, PrinciplesSection, FAQAccordion, ContactCTA, Footer, …
components/admin/         AdminShell, ResourceManager, ResourceList, Modal, ConfirmDialog, ImageField, form UI
features/<entity>/        schema.ts (Zod + DTO), service.ts (server logic), hooks.ts (React Query), *Manager.tsx (CMS UI)
hooks/                    shared client hooks (resource query/mutation factory, media queries)
lib/                      prisma, axios, query client/keys, auth, storage, image processing, API helpers
prisma/                   schema, migrations, seed
scripts/                  set-admin-password.ts
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Development server |
| `bun run build` | `prisma generate` + production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `bun run typecheck` | Route type generation + `tsc --noEmit` |
| `bun run db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Database tasks |
| `bun run admin:password -- <username>` | Set/rotate an admin password |

## Build and deployment

1. Provision PostgreSQL and set the environment variables (at minimum `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, verified contact values).
2. `bun install && bun run db:deploy && bun run db:seed`
3. Rotate the admin password (see [Admin accounts](#admin-accounts)).
4. `bun run build && bun run start` (or deploy to your platform).

Notes:

- The build prerenders `/` from the database. If the database is unreachable at build time the page is built with empty states and refreshes itself within minutes once it is reachable.
- On Vercel or any serverless platform:
  - use `STORAGE_DRIVER=s3` (local uploads would be lost);
  - point `DATABASE_URL` at a transaction pooler (Supabase: port `6543`) and `DIRECT_URL` at the session/direct connection. Each instance keeps a pool of at most 5 connections ([`lib/prisma.ts`](lib/prisma.ts));
  - run `bun run db:deploy` yourself before deploying a release with new migrations; the build does not migrate.
- Serve the site over HTTPS only; session cookies are `Secure` in production.

## Pre-launch content checklist

From [`doc/DESIGN.md` §17](doc/DESIGN.md):

- [ ] Upload final, licensed hero imagery (otherwise the CSS placeholder artwork is shown).
- [ ] Add only confirmed partners with official logos.
- [ ] Set the verified email and WhatsApp number.
- [ ] Add only verified achievements/credentials.
- [ ] Confirm package prices, inclusions and scope in the CMS.
- [ ] Add only real, approved portfolio projects (in `/admin/portfolio`; new items start as drafts).
- [ ] Confirm legal company name and copyright wording.
- [ ] Review Indonesian copy.
- [ ] Test mobile, tablet, desktop, keyboard navigation and reduced motion.
- [ ] Check metadata and the social sharing preview.
