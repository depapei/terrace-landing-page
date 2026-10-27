# Local clone and build guide (Windows PowerShell)

This document records the initial workstation setup. Lead Management handoff instructions and verification results are shared separately. The lead migration remains unapplied; the owner must run it separately.

## Verified results (October 27, 2026)

- Dependency installation with the frozen Bun lockfile succeeded. Network approval was needed after the sandboxed attempt stalled.
- `bun run lint` passed (exit code 0).
- `bun run build` passed (exit code 0), including TypeScript and generation of 29 pages.
- The first build found an incomplete ambient type package in the ancestor directory `C:\Users\josep\Documents\node_modules\@types\serve-static`. `tsconfig.json` now sets `typeRoots` to `./node_modules/@types`, keeping automatic ambient type discovery within this repository. The subsequent build passed.
- Database authentication warnings are expected with the template credentials. Public pages built with empty-content fallbacks. Database migrations, seeding, and CMS functionality have not been verified.
- Next.js warned that it ignored an ancestor package-lock.json outside this Git repository; this did not prevent the build.
- A production server was started during the subsequent database setup; see the latest results below. No changes were committed or pushed.

## Checkout

The repository was cloned into `C:\Users\josep\Documents\Terrace\terrace-landing-page`:

```powershell
cd C:\Users\josep\Documents\Terrace
git clone https://github.com/depapei/terrace-landing-page.git terrace-landing-page
cd terrace-landing-page
git pull --ff-only origin main
git switch -c tester-joseph
```

The pull reported `Already up to date`. The current working branch is `tester-joseph`, created from main. No branch has been pushed and no pull request has been opened.

## Tools and dependencies

Node.js v22.21.0 was already available. Bun was missing, so Bun 1.4.4 (the version specified in package.json) was installed under the parent workspace's `.tools` folder:

```powershell
# Run from C:\Users\josep\Documents\Terrace
npm.cmd install --prefix .tools --no-save --package-lock=false bun@1.4.4
```

From the repository folder, use the local Bun executable:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' --version
& '..\.tools\node_modules\.bin\bun.cmd' install --frozen-lockfile
```

If Bun is installed on PATH on another machine, use `bun` in place of that executable path.

## Environment and database

`.env.example` was copied to `.env`. The copied database URL is a placeholder, not a configured database. Edit `.env` with your development PostgreSQL connection string. Do not commit `.env`.

For a fresh checkout only (do not overwrite an existing .env):

```powershell
Copy-Item .env.example .env
```

The README requires PostgreSQL 14+. After configuring your own development database and a private SEED_ADMIN_PASSWORD, run:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' run db:migrate
& '..\.tools\node_modules\.bin\bun.cmd' run db:seed
```

These commands modify the configured database. They have not been run during setup because no real database credentials were supplied. See README.md for storage and other environment settings. NEXT_PUBLIC_* values are embedded during build, so rebuild after changing them.

## Build and run

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' run build
& '..\.tools\node_modules\.bin\bun.cmd' run start
```

The build script runs `prisma generate && next build`; it does not migrate the database. The application handles an unavailable database with empty public content. A real database is required for the CMS.

Open http://localhost:3000 after starting. Stop with Ctrl+C. For development, use `run dev` instead of `run start`.

Optional project checks:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' run lint
& '..\.tools\node_modules\.bin\bun.cmd' run typecheck
```

## Bring future main changes into your branch

Commit your work or stash it before updating:

```powershell
git switch tester-joseph
git fetch origin
git merge origin/main
```

This updates the working branch with main's changes. Resolve any conflicts if Git reports them.

To update local main and create a different new branch:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/your-task
```

After making and committing your changes, publish the branch when ready:

```powershell
git push -u origin tester-joseph
```

A pull from main downloads and integrates changes. A pull request is a separate request to merge your published branch into main.



## Database setup completed after credentials were configured

The user configured .env privately. No credentials are included in this guide.

- Connected to the local terrace database at localhost:5432.
- Applied all four committed migrations successfully using db:deploy.
- Ran db:seed successfully: created admin and ensured two default solution packages.
- Rebuilt successfully with database content and no database authentication errors.
- Started the production server at http://localhost:3000.
- Verified homepage HTTP 200 and two solution packages from /api/public/landing.
- Admin login and other CMS actions have not been tested.

These results supersede the initial placeholder-database limitations above.

Commands used from the repository folder:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' run db:deploy
# The seed subprocess invokes bun by name, so expose the local executable:
$env:PATH = (Resolve-Path '..\.tools\node_modules\.bin').Path + ';' + $env:PATH
& '..\.tools\node_modules\.bin\bun.cmd' run db:seed
& '..\.tools\node_modules\.bin\bun.cmd' run build
& '..\.tools\node_modules\.bin\bun.cmd' run start
```

The admin password is separate from the PostgreSQL password. It is the SEED_ADMIN_PASSWORD value if configured before seeding, otherwise the initial password documented in README.md. Follow the README admin password rotation instructions before public use.
