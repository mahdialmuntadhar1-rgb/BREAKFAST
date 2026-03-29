# BREAKFAST (Iraq Compass)

Production-ready Vite + React client for Iraq Compass, finalized for a **Supabase-only** backend.

## Stack
- React 19 + TypeScript
- Vite 6
- Supabase Auth + PostgREST API

## Required environment variables
Create `.env.local` (or `.env`) with:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=optional_for_ai_features
```

## Development
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run lint
npm run build
```

## Deployment
- Static deployment target (Vercel/Netlify/Cloudflare Pages/S3+CDN).
- Build output: `dist/`.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in deployment environment.

## Supabase tables used by the app
- `businesses`
- `posts`
- `stories`
- `deals`
- `events`
- `business_postcards`
- `users`

## Auth modes
- Google OAuth
- Email/password sign-in
- Email/password sign-up
