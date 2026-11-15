# Security runbook

## Secrets

The app reads secrets from `.env.local` (dev) or the deploy platform's environment variables (prod). Nothing in the repo should ever hold a real secret.

| Env var | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string with embedded user+password. |
| `MONGODB_DB` | Database name within the cluster. |
| `NEXTAUTH_URL` | Canonical URL. Must be `https://…` in production. |
| `NEXTAUTH_SECRET` | Signs JWT session tokens. Rotating invalidates every active session. |

### Rotating NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Paste the output into `.env.local` or your host's env panel. Restart the app. All users will be signed out.

### Rotating Mongo credentials

1. In Atlas → Database Access → edit the user and set a new password (or create a replacement user).
2. Rebuild the connection string.
3. Update `MONGODB_URI` in `.env.local` and in every deploy environment.
4. Deploy. The old user can be deleted from Atlas once no environment uses it.

### Known exposures to rotate now

- The Atlas user `agnesallison52_db_user` and password shared in chat during development. **Rotate before the app takes real user data.**
- The previous dev `NEXTAUTH_SECRET` placeholder (`dev-only-change-me-…`) — already replaced with a fresh value on 2026-11-13.

## Hardening already in place

- **Admin route guard** — `middleware.ts` checks `token.role === 'admin'` for `/admin/*` and redirects non-admins to `/dashboard?denied=admin`.
- **Rate limiting** — Mongo-backed sliding window on `/api/auth/register`, `/api/auth/forgot`, `/api/auth/reset`, `/api/auth/verify-email` (POST), `/api/support`, `/api/partners/apply`, and `/api/events/[slug]/register`. Returns HTTP 429 with `Retry-After`.
- **Account lockout** — 5 failed sign-ins per email in a 15-minute rolling window locks the account for 15 minutes. Tracked in the `loginattempts` collection (TTL-indexed).
- **Audit trail on sign-in** — `auth.signin.success`, `auth.signin.failure`, and `auth.signin.locked` events are written to the `auditlogs` collection with `severity` set appropriately.
- **Session role re-validation** — The NextAuth JWT callback re-reads `role` from the DB every 5 minutes. Demoting a user takes effect within one refresh, not just at next sign-in.
- **Last-admin guard** — `PATCH /api/admin/users/:id` refuses to demote the only remaining admin.
- **Duplicate-registration guard** — A compound unique index on `(eventSlug, email)` plus an explicit pre-check prevents the same email from registering twice for one event.
- **Capacity guard** — `Event.capacityLimit` (optional) caps total `partySize` at the event. Set per event; leave unset for uncapped.
- **TTL cleanup for auth tokens** — The `authtokens` collection has a TTL index on `expiresAt`; verify and reset links are issued here and auto-purged after they expire.
- **Health probe** — `GET /api/healthz` returns 200 when connected to Mongo, 503 otherwise.

## Sprint 2 additions (2026-11-13)

- **Email delivery** — `lib/email.ts` sends via Resend when `RESEND_API_KEY` is set; otherwise prints to the console (dev). Wired into register, forgot, verify-resend, event-register, support-ack, volunteer-approved, and announcement fan-out.
- **File uploads** — `POST /api/uploads` (multipart). Uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, else writes under `public/uploads/<ownerId>/`. 10 MB cap, allowlist of PDF/DOC/XLS/image/txt/csv.
- **Verified-email gate** — `lib/verifiedGate.ts` + `VerifiedBanner` component. Unverified users see a banner on the dashboard and can't POST to `/api/me/churches` or `/api/me/messages`. Admins bypass.
- **Scheduled-announcement cron** — `GET|POST /api/cron/announcements` processes any `scheduled` announcement whose `scheduledFor <= now`. Auth: `Authorization: Bearer $CRON_SECRET`, or Vercel Cron's `x-vercel-cron` header.
- **GDPR** — `GET /api/me/export` returns a JSON dump of the signed-in user's data. `POST /api/me/delete` (password + "DELETE" confirm) hard-deletes everything owned by the user.
- **Avatar + document uploads** — `User.avatarUrl` added; `Document.fileUrl` + `contentType` added. Clients upload to `/api/uploads` and then save the returned URL via the existing create endpoint.

## Still pending (Sprint 3+)

- Server Component conversion of public pages (perf + SEO).
- Pagination on admin list UIs.
- Observability (Sentry, structured logs).
- Automated test suite (Vitest + Playwright).
- Scheduler for event reminder emails.
- Real-time updates, toast system, CSV export.

## Operational playbook

- **Admin added** — use `npm run db:promote <email>`. Audit entry gets written automatically.
- **User reports locked account** — check `loginattempts` in Atlas; delete the doc to unlock, or wait 15 minutes.
- **Suspicious sign-in burst** — query `auditlogs` for `action: 'auth.signin.failure'` grouped by IP; add the IP to Atlas's deny list or your WAF.
- **Mongo appears down** — `GET /api/healthz` should report `db: 'disconnected'`.
- **Schedule the announcement cron** — on Vercel, add a `vercel.json` cron entry pointing at `/api/cron/announcements` every 5 minutes. On other hosts, call it with `curl -H "Authorization: Bearer $CRON_SECRET"` from your scheduler.
- **Rotate `BLOB_READ_WRITE_TOKEN`** — files already written stay accessible by URL; new uploads use the new token. Old tokens can be revoked from the Vercel dashboard.
- **GDPR deletion request** — direct the user to Settings → "Delete account". If they can't sign in, verify identity through a side channel, then delete manually from Atlas (collections: users, eventregistrations, volunteerapplications, userchurchmemberships, notifications, documents, tasks, messages, messagethreads, authtokens, loginattempts).
