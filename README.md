<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Iraq Compass — Run and deploy

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/422ad25e-51be-460b-b909-965e6d429179

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set `GEMINI_API_KEY` in `.env.local` if you use Gemini-powered features.
3. Verify `firebase-applet-config.json` points to your target Firebase project.
   - The app falls back to local mock data when the config is not production-ready.
4. Run the app:
   `npm run dev`

## Pre-publish checks

Run:

```bash
npm run lint
npm run build
bash scripts/verify-deploy.sh
```
