# Iraq Compass — Deep-Layer Final Inspection (Codebase Snapshot)

Audit date: 2026-03-25 (UTC)

## Scope actually found in this repository
- React/Vite frontend with Supabase read queries for `businesses`.
- No Firebase SDK usage, no Firestore rules file, no Cloudflare Worker code, no backend pipeline scripts in this repository snapshot.

---

## Zone-by-zone checklist (Zone | Check | Status | Fix)

| Zone | Check | Status | Fix |
|---|---|---|---|
| 1 | Email/password signup persists to Supabase Auth + Firestore `users/{uid}` in one transactional flow | **FAIL** | Replace `AuthModal` mock submit with real `supabase.auth.signUp()` then call Cloud Function `provisionUserProfile(uid, role)`; block login completion until profile write succeeds. |
| 1 | Silent failure handling when Auth succeeds but Firestore role doc write fails | **FAIL** | Add `registration_status` gate and send incomplete users to `/onboarding/role-selection` on every session restore. |
| 1 | Google OAuth first-login role interceptor | **FAIL** | After OAuth callback, if `users/{uid}.role` missing, hard-redirect to role picker and deny dashboard access. |
| 1 | Default role safety (no accidental admin) | **FAIL** | Enforce server-side default `role='regular_user'`; reject any client-provided `admin` role on create. |
| 1 | Role sync source-of-truth and revalidation hook/middleware | **FAIL** | Use one source of truth (`users/{uid}.role` in Firestore), and revalidate in route guard before rendering protected routes. |
| 1 | Expired JWT handling | **FAIL** | Add auth listener (`onAuthStateChange`) + refresh/error branch to route to login with flash message. |
| 2 | Supabase range math correctness (`0..49` => 50 rows) | **PASS** | Keep `to = from + pageSize - 1`; add unit test for `(page=0,pageSize=50)` and `(page=1,pageSize=50)`. |
| 2 | Load-more uses next window (`50..99`) | **PASS** | Keep `setPage(prev => prev + 1)` and query from derived `from/to`. |
| 2 | Filter + pagination ghost data protection (offset reset + clear prior list) | **FAIL** | On filter/search/governorate change: `setPage(0); setDirectoryBusinesses([]); setHasMore(true);`. |
| 2 | Request race protection for rapid filter taps | **FAIL** | Add `AbortController` per fetch and ignore stale responses by request id. |
| 2 | Empty state UX when no records | **PARTIAL** | Show explicit zero-results card + hide Load More when `filteredBusinesses.length===0 && !isLoading`. |
| 2 | Search + filter applied in one Supabase query | **FAIL** | Build one query with `.ilike('name', '%q%')` + category/governorate filters server-side before `.range()`. |
| 3 | Phone normalization for `+964`, `00964`, `0964` variants | **FAIL (not implemented)** | Normalize to E.164 (`+964...`) before validation and store original in `raw_phone`. |
| 3 | Safe upsert for apostrophes / unicode / SQL injection | **FAIL (not implemented)** | Use parameterized upsert via Supabase client RPC/insert API; avoid string-concatenated SQL. |
| 3 | Image health-check + hero selection quality logic | **FAIL (not implemented)** | Preflight image URLs (HEAD/GET), keep only 200s, choose hero by best dimension/bytes not index 0. |
| 3 | City normalization edge mapping (Bakrajo/Ankawa/Sadr City/Tuz Khurmatu) | **FAIL (not implemented)** | Add deterministic mapping table + fallback geocoder confidence threshold. |
| 3 | Duplicate detection across multiple scrape categories | **FAIL (not implemented)** | Upsert on canonical key (`normalized_name`,`normalized_city`,`lat_bucket`,`lng_bucket`). |
| 4 | Logged-out console calls blocked for post/listing creation | **FAIL (no rules present)** | Enforce Firestore rules `request.auth != null` and server token validation in Worker. |
| 4 | Role-protected createListing/admin tooling | **FAIL (no rules present)** | Require role lookup from `users/{uid}` in rules + backend check in Worker. |
| 4 | Role escalation prevention (`role` write-protected) | **FAIL (no rules present)** | Disallow client writes to `users/{uid}.role`; only Admin SDK/Cloud Function can change role. |
| 4 | Rate limiting 10 posts/hour/user + IP+UID in Worker | **FAIL (not implemented)** | Implement Durable Object/KV counters keyed by `uid:hour` and `ip:minute`. |
| 5 | 2-column integrity at 375/360/320 widths | **PARTIAL** | Add explicit `grid-cols-2` fallback tuning for 320px + truncate long titles. |
| 5 | Lazy loading + placeholder + CLS protection | **FAIL** | Add `loading="lazy"`, `width/height`, and skeleton placeholders to all business images. |
| 5 | Mobile hero image sizing/WebP/fallback | **FAIL** | Serve transformed `?w=400&format=webp` URLs and set `onError` placeholder. |
| 5 | Touch targets >=44px, load-more spinner, tab padding | **PARTIAL** | Increase small controls to `min-h-11 min-w-11`; replace "Loading..." text with spinner+disabled state. |
| 5 | Offline banner + cached last-loaded postcards | **FAIL** | Add service worker + IndexedDB cache and online/offline event banner. |
| 6 | `/admin/*` and `/dashboard/*` protected by live role guard | **FAIL** | Move to router-based guarded routes and fetch live role before rendering route element. |
| 6 | Owner isolation at DB level (`owner_id == uid`) | **FAIL (not implemented)** | Enforce Supabase RLS policy `using (owner_id = auth.uid())`. |
| 6 | Admin pipeline trigger + audit logs | **FAIL (not implemented)** | Restrict endpoint by role claim and insert immutable audit row per run. |
| 7 | Deep-linkable business detail routes | **FAIL** | Add route `/business/:slug` and load by slug/id with not-found fallback. |
| 7 | Contact buttons hide/disable on null fields | **FAIL** | Conditionally render buttons; if all empty, show "No contact available" state. |
| 7 | Gallery swipe + one-image edge case | **FAIL** | Use swipe carousel with `images.length===1` static hero mode. |
| 8 | Arabic/Kurdish/transliterated search coverage | **FAIL** | Add normalized search columns and `.ilike`/FTS on multilingual fields. |
| 8 | Search+filter in same query | **FAIL** | Compose one Supabase query chain before pagination. |
| 8 | Debounce >=300ms + index/FTS | **FAIL** | Add `useDebounce(300)` and PostgreSQL GIN index on `to_tsvector('simple', title || ' ' || postcard_content)`. |
| 9 | User-facing error feedback for all critical failures | **PARTIAL** | Standardize `<ErrorState code retry>` component with actionable copy. |
| 10 | Pre-launch security/perf/data/UX checklist readiness | **FAIL** | Block launch until critical blockers below are closed and re-tested. |

---

## Zone 2 manual pagination test script

1. Open Business Directory with network tab enabled.
2. Verify first request sends page window `0..49` and UI renders exactly 50 cards.
3. Tap **Load more** once; verify request window `50..99` and total list is 100 without duplicates.
4. Apply governorate filter (e.g., Sulaymaniyah): assert page resets to 0, old list cleared before new append.
5. While filtered, tap category A → B → A quickly: ensure old requests are canceled and final UI matches latest selected category only.
6. Enter search text while filter active: verify SQL includes both constraints (search + filter) and page resets.
7. Force 0-result query: verify explicit empty-state card and **Load more** hidden.
8. Use browser back/forward: verify pagination/filter state restores from URL params (not lost state).

---

## Zone 3 data validation test suite outline

- **Phone tests**: `+964`, `00964`, `0964`, malformed local formats, mixed spaces/dashes.
- **Upsert safety tests**: apostrophes, Arabic/Kurdish unicode, duplicate names with case/diacritic variance.
- **Image integrity tests**: 3 URLs with one 404, all 200 low-res vs one high-res, broken MIME type.
- **City normalization tests**: Bakrajo→Sulaymaniyah, Ankawa→Erbil, Sadr City→Baghdad, Tuz Khurmatu policy decision snapshot test.
- **Duplicate merge tests**: same POI across two categories merges categories/tags rather than duplicate rows.

---

## Zone 4 — Ready-to-deploy Firestore Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthed() {
      return request.auth != null;
    }

    function isSelf(uid) {
      return isAuthed() && request.auth.uid == uid;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function userRole() {
      return isAuthed() && userDoc().data.role;
    }

    function isAdmin() {
      return isAuthed() && userRole() == 'admin';
    }

    function isBusinessOwner() {
      return isAuthed() && userRole() == 'business_owner';
    }

    // User profile: allow self read/update EXCEPT role changes.
    match /users/{uid} {
      allow read: if isSelf(uid) || isAdmin();
      allow create: if isSelf(uid)
        && request.resource.data.role in ['regular_user', 'business_owner']
        && request.resource.data.role == 'regular_user';

      // Prevent role escalation from client.
      allow update: if isSelf(uid)
        && request.resource.data.role == resource.data.role;

      allow delete: if false;
    }

    // Posts owned by creator; only owner can update/delete.
    match /posts/{postId} {
      allow read: if true;
      allow create: if isAuthed()
        && request.resource.data.owner_id == request.auth.uid
        && request.resource.data.created_at is timestamp;
      allow update, delete: if isAuthed() && resource.data.owner_id == request.auth.uid;
    }

    // Comments owned by creator; only owner can delete.
    match /comments/{commentId} {
      allow read: if true;
      allow create: if isAuthed()
        && request.resource.data.owner_id == request.auth.uid
        && request.resource.data.post_id is string;
      allow update: if isAuthed() && resource.data.owner_id == request.auth.uid;
      allow delete: if isAuthed() && resource.data.owner_id == request.auth.uid;
    }

    // Likes: one like per user per post via deterministic docId `${postId}_${uid}`.
    match /likes/{likeId} {
      allow read: if true;
      allow create: if isAuthed()
        && request.resource.data.user_id == request.auth.uid
        && likeId == (request.resource.data.post_id + '_' + request.auth.uid)
        && !exists(/databases/$(database)/documents/likes/$(likeId));
      allow delete: if isAuthed() && resource.data.user_id == request.auth.uid;
      allow update: if false;
    }

    // Business listings writable only by business owners/admin.
    match /listings/{listingId} {
      allow read: if true;
      allow create: if isBusinessOwner() || isAdmin();
      allow update, delete: if isAdmin()
        || (isBusinessOwner() && resource.data.owner_id == request.auth.uid);
    }

    // Admin-only operational collections.
    match /pipeline_runs/{runId} {
      allow read, write: if isAdmin();
    }

    match /audit_logs/{logId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Zone 5 mobile audit checklist by breakpoint

### 320px (old Android)
- [ ] Card media constrained with fixed aspect ratio to prevent overlap.
- [ ] Buttons and icon controls are minimum 44px touch targets.
- [ ] Two-column cards preserve readable title lines (ellipsis after 2 lines).

### 360px (Galaxy A series)
- [ ] Grid gutters stay >= 8px and no horizontal scroll.
- [ ] Load-more button shows spinner and disabled state during fetch.
- [ ] Image placeholders prevent layout shift on slow 3G.

### 375px (iPhone SE)
- [ ] Sticky header does not cover first interactive element.
- [ ] Filter chips have thumb-friendly horizontal/vertical padding.
- [ ] Offline banner visible and non-blocking when connection drops.

---

## Zone 6 route guard pattern + DB-level checklist

**Route guard pattern**
1. `RequireAuth` checks session.
2. `RequireRole(['business_owner','admin'])` fetches live role (Firestore/Supabase) before route render.
3. Guard returns loading skeleton while role resolves; then redirect unauthorized users to `/403`.

**DB-level checklist**
- [ ] Supabase table policies enforce `owner_id = auth.uid()` for owner content.
- [ ] Admin-only mutations are blocked by RLS and backend role verification.
- [ ] No security decision depends solely on localStorage role flags.

---

## Zone 7 deep-link + contact button test matrix

- `/business/:slug` direct open (cold load) returns business details.
- Shared link open from external app resolves same record consistently.
- Phone button formats `tel:+964...` and works on Android/iOS.
- Website/Instagram buttons hidden when null.
- If phone+website+instagram all null: show “No contact available”.
- One-image business: gallery renders static hero without broken nav dots.

---

## Zone 8 multilingual search test cases

- EN: `pizza`, `cafe`, `pharmacy`
- AR: `مطعم`, `صيدلية`, `حلويات`
- KU: `خواردنگه`, `دەرمانخانە`, `قاوەخانە`
- Transliteration: `kafe`, `shawarma`, `slemani`
- Combined filter: `pizza + Sulaymaniyah + category=food_drink`
- Empty case: nonsense term should produce guided empty state.

---

## Zone 9 error state inventory + UI copy

- Supabase fail: **"We couldn't load businesses. Please try again."** + Retry button.
- Firebase write fail: **"Post not published. Check your connection and retry."**
- Image 404: show placeholder card image + **"Image unavailable"** badge.
- Token expired: **"Session expired. Please sign in again."**
- Empty category: **"No businesses found in this category yet."**
- Offline: **"You're offline. Showing saved results."**
- Pipeline 0 rows: admin toast **"Pipeline completed with 0 imported records."**
- Invalid phone: log to `flagged_businesses` + **"Record flagged: invalid Iraqi phone format."**
- Empty form submit: inline field error **"This field is required."**
- Rate limit hit: **"Too many requests. Try again in {seconds}s."**

---

## Zone 10 pre-launch final checklist status

### Security
- [FAIL] Env vars only in `.env` (Supabase URL+anon are hardcoded fallback values).
- [UNKNOWN/FAIL] RLS on all Supabase tables cannot be verified in repo.
- [FAIL] Firebase domain restriction not represented in repo.
- [FAIL] Cloudflare Worker CORS restriction not present in repo.
- [FAIL] Console logs exist in production path.

### Performance
- [UNKNOWN] Lighthouse mobile >=80 not measured in this snapshot.
- [FAIL] Not all images use lazy loading.
- [FAIL] Search input updates each keystroke with no debounce.
- [UNKNOWN/FAIL] Required Supabase indexes not verifiable from migration files.

### Data integrity
- [UNKNOWN] 18 governorates coverage not verifiable from repo-only code.
- [UNKNOWN/FAIL] Non-null hero image rule not enforced in query path.
- [UNKNOWN/FAIL] City normalization logic absent.
- [FAIL] Duplicate upsert tests absent.

### UX
- [UNKNOWN] <3s on simulated 3G not benchmarked.
- [PARTIAL] Some controls pass touch target, not all verified.
- [PARTIAL] Multi-language text exists; RTL behaviors partially implemented.
- [FAIL] No share/deep-link detail route implemented.

---

## Critical blockers (must fix before launch)

1. Replace mock auth flow with real auth + role provisioning and recovery path.
2. Implement Firestore rules + role write-protection + backend JWT validation.
3. Add route guards for dashboard/admin based on live role, not local UI state.
4. Fix pagination/filter/search coupling (reset state, single query composition, request cancelation).
5. Remove hardcoded Supabase anon key fallback and production console logs.
6. Implement detail route/deep links and null-safe contact CTA logic.

## Nice to have (v1.1)

1. Service worker + offline cached postcard browsing.
2. Hero image transformation pipeline (WebP + responsive widths).
3. Enhanced transliteration search relevance scoring.
4. Admin observability dashboard for rate limit and pipeline quality metrics.

---

## Launch confidence score

**27 / 100**

Scoring basis:
- Passed: 2 checks (core range math, load-more increment)
- Partial: 5 checks
- Failed/Not implemented/Unknown critical controls: remaining majority across auth, security, route protection, backend governance, and mobile resilience.

**Release recommendation:** **NO-GO** until critical blockers are fixed and re-audited end-to-end.
