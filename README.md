# BREAKFAST (Iraq Compass)

Production app for Iraq Compass, finalized for **Supabase-only** backend usage.

## Tech stack
- React + TypeScript + Vite
- Supabase Auth + Supabase PostgREST data access
- Motion UI animations

## Required environment variables
Copy `.env.example` to `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (optional; needed for Data Architect/Gemini features)

## Run locally
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run lint
npm run build
```

## Supabase tables expected
- `users`
- `businesses`
- `posts`
- `stories`
- `deals`
- `events`
- `business_postcards`

## Deployment
Deploy as a standard Vite SPA (Netlify/Vercel/static host). Ensure env vars are set in deployment settings.
