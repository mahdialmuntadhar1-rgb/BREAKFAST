# BREAKFAST (Iraq Compass)

Production app for Iraq Compass, finalized to run on **Supabase-only backend**.

## Tech Stack
- React + Vite + TypeScript
- Supabase Auth + Supabase PostgREST data access

## Required Environment Variables
Create `.env.local` from `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (optional)

## Local Development
```bash
npm install
npm run dev
```

## Quality Checks
```bash
npm run lint
npm run build
```

## Supabase Tables Expected
- `users`
- `businesses`
- `posts`
- `stories`
- `deals`
- `events`
- `business_postcards`

## Auth Notes
- Google OAuth is supported via Supabase Auth.
- Email/password sign in and sign up are supported.

## Deployment
This is a static Vite app. Deploy to any static host (Vercel/Netlify/Cloudflare Pages) and set the same environment variables in production.
