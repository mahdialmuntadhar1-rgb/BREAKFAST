<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/422ad25e-51be-460b-b909-965e6d429179

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel (new project)

If Vercel keeps asking to link to an existing project, use the non-interactive flags below to force creation of a brand new project.

1. Install dependencies:
   `npm install`
2. Remove local Vercel metadata (if present):
   `rm -rf .vercel`
3. Deploy and force fresh project setup:
   `vercel --prod --force`
4. At prompts, choose:
   - **Set up and deploy** (not "Link to existing project")
   - Scope: your personal/team account
   - Project name: `iraq-business-directory` (or similar)
   - Directory: `.` (repo root)

### If it still links unexpectedly

Run:

`vercel link --project iraq-business-directory --yes`

Then redeploy:

`vercel --prod --force`

### Required environment variables

Add these in the Vercel Dashboard → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Post-deploy checks

1. Run your Supabase schema in Supabase SQL editor from `supabase_schema.sql`.
2. Verify API health:
   `curl https://[deploy-url].vercel.app/api/health`
