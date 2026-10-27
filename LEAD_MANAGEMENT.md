# Lead Management: owner handoff

## Migration is prepared, not applied

The lead-management implementation is on the `tester-joseph` branch, separate from `main`. No database migrations, seeds, or live lead writes were executed while implementing or locally verifying this feature. Earlier local setup migrations documented in LOCAL_SETUP.md predate this request and do not include lead management.

Prepared migration:

`prisma/migrations/20261028000000_lead_management/migration.sql`

It adds three enums (`LeadSource`, `LeadContactType`, `LeadStatus`), the `Lead` table, a separate `LeadSubmissionLimit` table, and indexes. It does not drop or modify existing CMS tables or data. The generated Prisma Client has been updated locally; generated files remain git-ignored and are regenerated on installation/build.

The SQL was compared with Prisma's offline diff between the committed schema and the updated schema. They match after ignoring comments/whitespace. This validates the prepared SQL against the schema, but does not prove it has been applied or that an existing database has no drift.

## Owner steps

Use the intended database in .env. Review the migration and back up the target database before applying it. DIRECT_URL, when set, is the Prisma CLI connection; otherwise it uses DATABASE_URL. For app verification, both must refer to the same intended database.

The following commands are for the owner to run manually. They were not run by the agent for this feature:

```powershell
cd C:\Users\josep\Documents\Terrace\terrace-landing-page
# If Bun is installed on PATH:
bun run db:deploy
```

On this workstation Bun is installed locally under the parent workspace, so the equivalent command is:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' run db:deploy
```

`db:deploy` applies pending committed migrations. Do not run both forms unnecessarily. No new seed is required for lead management. Existing admin accounts remain usable.

Configure `NEXT_PUBLIC_CONTACT_WHATSAPP` with the official business number (country code and digits only). It is currently unset in this checkout. The form remains usable without it, but WhatsApp links are hidden. This uses the app's existing setting, not a hardcoded destination. Rebuild after changing NEXT_PUBLIC_* configuration.

After migration/configuration, rebuild and serve:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' run build
& '..\.tools\node_modules\.bin\bun.cmd' run start
```

The agent's verification build deliberately used an unavailable database URL and therefore generated public empty-content fallbacks. Rebuild against the intended environment for the owner's verification. The earlier preview server was stopped; no updated server is left running by the agent.

## Implemented behavior

- `/admin/leads` is protected by the existing admin layout and API authentication. All current admin accounts share access; roles and sales assignment are outside the MVP.
- Potential Leads: create, view, edit, confirm deletion, search by company, filter by status, and paginate (20 per page).
- Self Form: view original customer details; update status and internal notes. Original company/contact/requirements cannot be replaced through PUT, and Self Form entries cannot be deleted through the potential-lead endpoint.
- Both sources start as NEW. Statuses are NEW, CONTACTED, FOLLOW_UP, INTERESTED, CONVERTED, LOST.
- One primary contact per lead. Public contacts are WhatsApp or email. Potential leads also support Instagram, website, Google Maps, and Other.
- The public contact section offers an inquiry form and an independent direct WhatsApp link when configured. Direct WhatsApp does not require the form and does not create a database lead automatically.
- Public submission validates and saves first. Only a successful save (or matching retry of an already-saved submission) returns a prefilled WhatsApp link. The browser attempts to open it in a new tab, and a visible continuation link remains available if popups are blocked. The visitor must press Send inside WhatsApp.
- Without a WhatsApp destination, successful submissions show a saved confirmation and the team can follow up using the recorded contact.
- Requirements and internal notes are distinct fields. Internal notes and lead records are never included in public API responses.

## Endpoint contract

| Endpoint | Access and purpose |
| --- | --- |
| POST `/api/public/leads` | Public submission only; no public GET/list/detail |
| GET `/api/admin/leads` | Authenticated list; source, status, search, page query parameters |
| POST `/api/admin/leads` | Authenticated potential lead creation; fixed POTENTIAL/NEW |
| GET `/api/admin/leads/:id` | Authenticated details |
| PUT `/api/admin/leads/:id` | Authenticated full edit of a POTENTIAL lead |
| PATCH `/api/admin/leads/:id` | Authenticated status/internal-notes update |
| DELETE `/api/admin/leads/:id` | Authenticated deletion of a POTENTIAL lead |

The public request includes companyName, contactType, contactValue, requirements, a random UUID submissionKey, and a blank website honeypot. The server rejects unknown properties, including source/status/internalNotes. The public response is only `{ ok: true, whatsappUrl: string | null }`; it contains no database ID or record details.

All mutations require the existing same-origin check and `X-Terrace-Request: 1` header. Requests use bounded JSON bodies (32 KiB maximum). Required field and length checks run on both client and server. WhatsApp numbers must include a country code; no country is guessed. Only http(s) prospect website/Maps URLs are accepted.

## Spam prevention and retry behavior

- A honeypot rejects populated website values on the public form.
- Public submission is limited to 10 attempts per IP per 15-minute fixed window. The server returns 429 with Retry-After when exhausted. This quota includes validation failures and retries; admin login uses its own independent limiter.
- Limits are stored in PostgreSQL for consistency across server instances. Expired lead-limit buckets are removed as public requests arrive. IPs are stored as SHA-256 keys, not raw addresses.
- The deployment must set trustworthy forwarding headers and prevent untrusted clients from overriding them. The limiter follows the existing clientIp helper (x-forwarded-for / x-real-ip); without these, clients share the `unknown` bucket. Honeypot/origin checks are basic defenses, not a guarantee against determined bots. CAPTCHA can be added later if needed.
- The form disables submissions while saving. Unchanged retries on the same mounted form reuse a UUID. A unique database constraint prevents duplicate inserts, including concurrent retry races. A hash verifies that a reused UUID has the same normalized payload.
- Retry keys are held in memory, not persisted with customer data in browser storage. Reloading the page, starting another form, or changing input creates a new attempt; the same contact may intentionally have multiple leads. Cross-session contact deduplication remains outside this MVP.
- A short privacy-use notice is shown beside the submit button. The owner should review the copy and retention practices before launch.

## Verification completed without applying the migration

| Check | Result and limits |
| --- | --- |
| Prisma format and validate | Passed; schema-only checks |
| Prisma Client generation | Passed; local generated files only |
| Offline SQL/schema comparison | Passed; no datasource or shadow database used |
| Lead tests | 20 passed using mocked database/session access, including a static render check for both contact choices; no real database writes |
| ESLint | Passed |
| TypeScript / route type generation | Passed |
| Production build | Passed, including TypeScript and 32 generated pages; intentionally unavailable database URL, no live database writes. Expected database-unreachable fallback messages occurred. |
| Local public browser checks | Passed in headless Microsoft Edge: desktop/mobile rendering, required/email validation, failed-save behavior, retry key reuse, success, blocked-popup fallback, and missing-number confirmation. Successful submission responses were mocked; no WhatsApp messages were sent. |
| Local admin browser checks | Passed with the real LeadManager component in an isolated harness and mocked API: pagination, creation, search, edit, status filter, cancel/confirm deletion, Self Form details, and status/notes-only updates. This does not verify persistence or authenticated end-to-end flows. |
| Real local HTTP guards | Passed: public GET returns 405, unauthenticated admin API returns 401, admin page redirects to login, cross-origin submission returns 403, unavailable-database submission returns an error without opening WhatsApp. Server used an intentionally unavailable database URL. |

Browser fixtures and the temporary harness were verification tools only; they are not shipped as application routes or authentication bypasses. The temporary harness source was removed. Tests used synthetic contact data and an ephemeral test WhatsApp setting; the real .env was not changed. No uncaught browser errors occurred during these checks.

Tests cover public field injection, contact validation, honeypot, pagination bounds, safe URLs, defaults, contact normalization, retries and races, database-failure responses, source restrictions on edits/deletes, list filters, unauthenticated admin access, origin/header rejection, public response privacy, rate-limit response, immutable customer fields, and body limits.

To repeat the mocked tests:

```powershell
& '..\.tools\node_modules\.bin\bun.cmd' test tests/leads.test.js
```

With Bun on PATH, `bun run test:leads` is also available. None of the test, build, generate, lint, or typecheck scripts applies migrations.

## Verification requiring owner migration and a live database

The following are pending and must be checked by the owner after applying the migration:

1. Confirm the new migration is applied to the intended database and existing CMS records are preserved.
2. Login, open Lead Management, and create a Potential Lead. Confirm NEW status and correct source, then edit contact/details/notes, change status, search, filter, and confirm/cancel deletion.
3. Submit the public form. Confirm one SELF_FORM row with NEW status, normalized contact, and separate requirements. Check the Self Form admin tab; update notes/status and confirm original customer details remain unchanged.
4. Submit more than 20 test entries if verifying pagination at scale. Check filters on later pages and after deleting the last item on a page.
5. Verify real PostgreSQL unique constraints and concurrent identical submissions create one row. Mocked tests exercise the code paths but do not establish live transactional behavior.
6. Verify the database-backed limiter returns 429 after the configured quota and recovers after the window; confirm login remains unaffected. Use a test environment because these checks create leads/rate buckets.
7. Verify unauthenticated requests to every admin endpoint are rejected and public GET `/api/public/leads` returns method-not-allowed. Confirm public responses and existing landing API contain no private lead data.
8. Test valid/invalid inputs, duplicate clicks, a network timeout followed by a retry, and a temporarily unavailable database. Failed saves must not open WhatsApp.
9. With an official destination configured and a rebuilt app, verify the direct WhatsApp link works without a form. Verify successful form submission opens a correctly encoded prefilled message, and the fallback link works with popups blocked. Test desktop and mobile WhatsApp handoff; opening a chat does not send a message.
10. Verify the integrated flows on desktop/mobile with the migrated database. Public form and isolated admin controls were browser-tested with mocked responses, but authenticated live CMS workflows, mobile WhatsApp app handoff, full keyboard navigation, and screen-reader behavior remain pending owner verification.

The migration must precede using the new lead endpoints. Before it is applied, submission/list requests will fail because the new tables do not exist; public submission failure does not redirect to WhatsApp.
