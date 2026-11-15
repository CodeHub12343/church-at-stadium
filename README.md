# Church at the Stadiums

Next.js 14 (App Router) + styled-components frontend for the Church at the Stadiums collaboration platform. The design mirrors the canvas spec: deep navy `#101B32` with royal gold `#C6A45B`, Plus Jakarta Sans headings over Inter body.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Routes

**Public**
- `/` — Home
- `/about` — About
- `/events` — Events list
- `/events/[slug]` — Event detail
- `/login` — Sign in
- `/register` — Create account

**Authenticated workspace** (mock, no auth guard)
- `/dashboard` — Church rep overview
- `/dashboard/churches` — My churches
- `/dashboard/events` — My events
- `/dashboard/tasks` — Tasks

**Admin**
- `/admin` — Control center
- `/admin/churches` — Verification queue
- `/admin/churches/[id]` — Review a church

## Architecture

- **App Router** — all pages in `app/`, grouped by shell (`(dashboard)`, `(admin)`) so each layer keeps its own layout.
- **Design tokens** — `lib/tokens.ts` holds colors, typography, radii, shadows, breakpoints.
- **Global styles** — `lib/GlobalStyle.tsx` resets, loads the font faces, exposes CSS variables.
- **SC SSR** — `lib/registry.tsx` is the styled-components registry Next.js needs to flush styles during server render.
- **Primitives** — `components/ui/*` (Button, Badge, Card, Input, StatCard).
- **Shells** — `components/public/*`, `components/dashboard/DashboardShell.tsx`, `components/admin/AdminShell.tsx`.
- **Mock data** — `lib/mockData.ts` seeds consistent sample events, churches, tasks across pages.

## What's not wired

Backend, authentication, real file uploads, email delivery, payments — this scaffold is UI only. Hooks for state live in client components; swap them for API calls when the backend lands.

Illustrative figures in dashboards and reports are explicitly marked as sample data.
