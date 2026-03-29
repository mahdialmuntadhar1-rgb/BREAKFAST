# BREAKFAST (Iraq Compass)

Production-focused Iraq Compass web app built with React + Vite and a Supabase-only backend.

## Features
- Supabase auth (Google OAuth + email/password)
- Supabase data for businesses, posts, stories, deals, events, postcards, users
- Governorate + language aware UX
- Listing and feed pagination with load-more

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and fill values.
3. Start dev server:
   ```bash
   npm run dev
   ```

## Required environment variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (only for AI helper features like Data Architect / City Guide)

## Build & checks
```bash
npm run lint
npm run build
```

## Deployment
This is a static Vite app. Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages) and configure the same environment variables.
