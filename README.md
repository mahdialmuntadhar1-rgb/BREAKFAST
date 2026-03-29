<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/422ad25e-51be-460b-b909-965e6d429179

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set required env vars in `.env.local` (see schema/setup below).
3. Run the app:
   `npm run dev`

## Supabase data-layer setup (Phase 1)

The app now reads these collections from Supabase first and falls back to local mock data when Supabase is empty, unavailable, or not configured:

- `businesses`
- `posts`
- `deals`
- `stories`
- `events`

### Required env vars

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Firebase env vars are still used for current auth/profile flows and write paths in this phase.

### Minimum table schema expected

> You can include extra columns, but keep at least these to ensure UI rendering works.

#### `businesses` (highest priority)
- `id` (text/uuid/integer primary key)
- `name` (text)
- `category` (text)
- `rating` (numeric)
- `city` (text, optional but recommended for filtering)
- `governorate` (text, optional but recommended for filtering)
- `is_featured` (boolean, optional)
- `is_verified` or `verified` (boolean, optional)
- `image_url` (text, optional)
- `review_count` (integer, optional)

#### `posts`
- `id`
- `business_id`
- `business_name`
- `business_avatar`
- `caption`
- `image_url`
- `created_at` (timestamp)
- `likes` (integer)
- `is_verified` (boolean, optional)

#### `deals`
- `id`
- `discount`
- `business_logo`
- `title`
- `description`
- `expires_in`
- `claimed`
- `total`
- `created_at` (timestamp, optional)

#### `stories`
- `id`
- `avatar`
- `name` or `user_name`
- `thumbnail`
- `type` (`business` or `community`)
- `media` (text[])
- `time_ago` (text)
- `verified` / `is_verified` (boolean, optional)
- `ai_verified` (boolean, optional)
- `is_live` (boolean, optional)

#### `events`
- `id`
- `image`
- `title`
- `date` (timestamp/date)
- `venue` (or `location`)
- `attendees` (integer)
- `price` (numeric)
- `category`
- `governorate`

### Quick manual verification (businesses)

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
2. Add at least 1 row to `businesses` with: `id`, `name`, `category`, `rating`.
3. (Recommended) Add `city`, `governorate`, `image_url`, `is_featured`.
4. Start app: `npm run dev`.
5. Open the business listing/home page and confirm your inserted business name appears.
6. Apply category/governorate/city filters and confirm matching Supabase data appears.
7. Temporarily clear table (or remove env vars) and confirm mock businesses still appear as fallback.
