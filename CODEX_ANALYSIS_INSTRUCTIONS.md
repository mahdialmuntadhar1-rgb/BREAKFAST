# Codex Full-Repo Analyzer Instructions

Use this instruction set when you want Codex to analyze the complete repository once, produce a full diagnosis, and reduce repeated paid analysis runs.

## Goal
Analyze the **entire repo** and generate:
1. **Current status** (what is already working)
2. **Diagnosis** (risks/issues/inconsistencies)
3. **Remaining tasks** (prioritized checklist for finalization)

## How to run
```bash
npm install
npm run codex:analyze
```

This writes `CODEX_STATUS_REPORT.md`.

## Required output format
When you (Codex) produce your analysis response, always use this structure:

### 1) Current Status
- Architecture snapshot
- Implemented features
- Build/typecheck status
- Auth/API/data status

### 2) Diagnosis
- Critical issues (must fix)
- Warnings (should fix)
- Tech debt / consistency issues
- Security & env configuration gaps

### 3) What Is Left To Do
- Prioritized checkbox list (`[ ]`)
- Group by: Config, Code, QA, Deployment
- Keep tasks concrete and assignable

## Analysis checklist (must cover)
- Project structure and key files
- `package.json` scripts and dependency health
- Firebase setup (`firebase.ts`, `firestore.rules`, Firebase JSON configs)
- Gemini integration (`services/api.ts`, env usage)
- UI flow completeness (`App.tsx`, major components)
- Environment variable completeness and docs quality
- TODO/FIXME markers and obvious placeholders
- Git recent activity for migration/context

## Handoff instruction
Write the final report so it can be sent directly to **Winser/Replit** to execute remaining tasks with minimal extra analysis.
