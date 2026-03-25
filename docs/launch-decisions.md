# Launch Decisions — Phase 0 (Unknowns Closure)

_Date: 2026-03-25_

This document captures what is **detectable from the repository** before implementing production hardening changes.

## 1) Firebase project IDs (dev / staging / prod)

### Detectable now
- **Configured project ID (single environment found):** `studio-6436865757-14c4f`.
- **Configured Firestore database ID:** `ai-studio-accadf3d-012c-4037-9b18-c758fba3ddf9`.

### Gap / decision required
- No separate **dev/staging/prod** project mapping is present in repo (no `.firebaserc` aliases or env-specific Firebase config files found).
- Decision needed: define three Firebase projects (or explicitly approve single-project launch risk).

## 2) How admin custom claims are currently assigned

### Detectable now
- No backend code found that calls Admin SDK custom-claim assignment APIs (e.g., `setCustomUserClaims`).
- Authorization appears to rely on:
  - Firestore `users/{uid}.role` document field, created client-side.
  - Firestore rules helper `isAdmin()` that checks `request.auth.token.admin == true`.

### Risk
- There is currently no claim-management flow in repo to mint the `admin` claim.
- Elevated role assignment is effectively client-influenced at account creation.

## 3) Whether any backend exists for Gemini proxying

### Detectable now
- **Yes.** Firebase Cloud Functions backend exists in `functions/src/index.ts`.
- Callable functions:
  - `generateJourney`
  - `generateBusinessTagline`
- Gemini is called from backend using secret parameter `GEMINI_API_KEY` via `defineSecret`, not directly from frontend.
- Basic per-UID in-memory rate limiting is implemented.

## 4) Hosting topology (Firebase Hosting only?)

### Detectable now
- Frontend is a Vite React SPA.
- Firebase client SDK + Firestore/Auth/Functions are configured.
- Cloud Functions code exists.

### Gap / decision required
- No `firebase.json` found, so hosting target(s), rewrites, and deploy topology are not version-defined here.
- Cannot confirm if production is:
  - Firebase Hosting only,
  - Firebase Hosting + Functions rewrites,
  - or another platform.

## 5) Missing Firestore index definitions

### Detectable now
- No `firestore.indexes.json` committed.
- Composite queries in app code likely requiring indexes:
  1. `businesses`: `where(category == ...)` + `orderBy(name)`.
  2. `business_postcards`: `where(governorate == ...)` + `orderBy(updatedAt desc)`.

### Gap / decision required
- Need a checked-in `firestore.indexes.json` and deployment path for staging/prod.

## 6) Environment variables / secrets required for production

### Detectable now
- **Required secret for backend functions:** `GEMINI_API_KEY` (Functions Secret Manager param).
- README references local `.env.local` use for Gemini key in local dev.

### Likely required operational config (not fully represented in repo)
- Firebase project selection/aliasing per environment.
- CI/CD deploy credentials/service account for Firebase deploys.
- Optional analytics/monitoring DSNs if observability tooling is added in later phases.

---

## Phase 0 status

- Unknowns closed to the extent possible from repository inspection.
- No application runtime behavior changed in this phase.
