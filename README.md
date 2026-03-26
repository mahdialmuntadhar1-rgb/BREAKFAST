<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Iraq Compass (Supabase + Cloudflare)

This app uses a Supabase-first architecture for authentication, data APIs, and realtime feeds, and is intended to deploy behind Cloudflare.

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Create `.env.local` with required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_AI_API_BASE_URL` (optional, only needed for AI-assisted features)
   - `VITE_CLOUDFLARE_ACCOUNT_ID` (required for deployment workflows)
   - `VITE_CLOUDFLARE_PROJECT_NAME` (required for deployment workflows)
   - `VITE_CLOUDFLARE_WORKER_NAME` (optional; only if your deployment scripts target Workers directly)
   - `GEMINI_API_KEY` (server-side only; do not expose to the browser bundle)
3. Run the app:
   `npm run dev`

## Build

`npm run build`

## Preflight / Launch Checks

Use the preflight script before release:

`./scripts/preflight.sh`

It validates:
- Type/lint checks (`npm run lint`)
- Production build (`npm run build`)
- Required Supabase + Cloudflare environment variables

## Architecture

- Auth: Supabase Auth (Google OAuth)
- Data: Supabase Postgres tables via `@supabase/supabase-js`
- Realtime: Supabase channels for social feed updates
- AI (optional): proxied through a secure backend endpoint (`VITE_AI_API_BASE_URL`)
- Edge/deploy: Cloudflare

## Production readiness without AI agents

If you want to ship a real directory product and completely ignore AI agents, this codebase supports that path.

### Current readiness (database-first mode)

With Supabase + Cloudflare configured, the app is broadly in a **~70% launch-ready range** for a non-AI release:

- ✅ Core app shell and feature pages are implemented.
- ✅ Supabase integration exists for auth and data.
- ✅ Initial SQL schema + RLS baseline migration is included.
- ⚠️ Final readiness depends on verifying your deployed Worker/API routes and production env wiring.
- ⚠️ Performance hardening (caching, regional tuning, query optimization) is still needed before scale.

### Minimum launch architecture (no AI agents)

Use this simple production shape:

1. **Frontend (Cloudflare Pages)**  
   Serves UI and calls your backend routes.
2. **Backend API (Cloudflare Worker or equivalent)**  
   Handles search/filter/detail APIs and enforces server-side rules.
3. **Database (Supabase Postgres)**  
   Stores businesses, posts, events, deals, and stories with RLS enabled.

### Go-live checklist

- [ ] Confirm deployed API routes are reachable from the frontend.
- [ ] Verify Supabase env vars are correct in every environment.
- [ ] Validate RLS policies in production (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies).
- [ ] Add API/database caching strategy for high-traffic reads.
- [ ] Run `./scripts/preflight.sh`, then smoke test search + business detail flow.

## Database setup (production baseline)

This repository now includes Supabase schema + RLS baseline migrations:

- `supabase/migrations/20260326_initial_schema.sql`

Apply with Supabase CLI from project root:

```bash
supabase db push
```

The migration includes:
- core tables (`users`, `businesses`, `posts`, `events`, `deals`, `stories`, `business_postcards`)
- row level security enabled on all tables
- policies for public reads, owner writes, and admin-only postcard ingestion
