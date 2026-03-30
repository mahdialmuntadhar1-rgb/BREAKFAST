#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'CODEX_STATUS_REPORT.md');

const CRITICAL_FILES = [
  'package.json',
  'README.md',
  'firebase.ts',
  'App.tsx',
  'services/api.ts',
  'firestore.rules',
  'firebase-applet-config.json',
  'firebase-blueprint.json',
  'tsconfig.json',
  'vite.config.ts',
];

const SOURCE_DIRS = ['components', 'hooks', 'services', 'scripts'];

const REQUIRED_ENV_KEYS = [
  'GEMINI_API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

const checks = {
  passes: [],
  warnings: [],
  errors: [],
  todos: [],
};

function fileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function safeRead(relativePath) {
  try {
    return readText(relativePath);
  } catch {
    return null;
  }
}

function runCommand(cmd) {
  try {
    const output = execSync(cmd, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });

    return { ok: true, output: output.trim() };
  } catch (error) {
    const message = error?.stderr?.toString()?.trim() || error?.message || 'Unknown error';
    return { ok: false, output: message };
  }
}

function collectFiles(relativeDir, matcher = null) {
  const dirPath = path.join(ROOT, relativeDir);
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const collected = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
          continue;
        }
        stack.push(fullPath);
      } else {
        const rel = path.relative(ROOT, fullPath);
        if (!matcher || matcher(rel)) {
          collected.push(rel);
        }
      }
    }
  }

  return collected.sort();
}

function parseEnvKeys(sourceText) {
  return sourceText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('=')[0])
    .filter(Boolean);
}

function extractEnvReferences(fileText) {
  const regex = /(?:process\.env|import\.meta\.env)\.([A-Z0-9_]+)/g;
  const keys = new Set();

  for (const match of fileText.matchAll(regex)) {
    keys.add(match[1]);
  }

  return [...keys];
}

function addFinding(type, message) {
  checks[type].push(message);
}

function run() {
  for (const requiredFile of CRITICAL_FILES) {
    if (fileExists(requiredFile)) {
      addFinding('passes', `Critical file present: ${requiredFile}`);
    } else {
      addFinding('errors', `Missing critical file: ${requiredFile}`);
    }
  }

  for (const dir of SOURCE_DIRS) {
    if (!fileExists(dir)) {
      addFinding('warnings', `Directory missing: ${dir}`);
      continue;
    }

    const count = collectFiles(dir).length;
    addFinding('passes', `${dir}/ contains ${count} files`);
  }

  const envExample = safeRead('.env.example');
  const envLocalExample = safeRead('.env.local.example');
  const envLocal = safeRead('.env.local');

  if (!envExample && !envLocalExample) {
    addFinding('warnings', 'No .env.example or .env.local.example found. Add one to document setup requirements.');
  }

  const declaredEnvKeys = new Set();
  if (envExample) parseEnvKeys(envExample).forEach((key) => declaredEnvKeys.add(key));
  if (envLocalExample) parseEnvKeys(envLocalExample).forEach((key) => declaredEnvKeys.add(key));

  for (const requiredKey of REQUIRED_ENV_KEYS) {
    if (!declaredEnvKeys.has(requiredKey)) {
      addFinding('warnings', `Environment key missing from env example files: ${requiredKey}`);
    }
  }

  if (envLocal) {
    const localKeys = new Set(parseEnvKeys(envLocal));
    const missingInLocal = REQUIRED_ENV_KEYS.filter((key) => !localKeys.has(key));
    if (missingInLocal.length > 0) {
      addFinding('warnings', `Local env is missing keys: ${missingInLocal.join(', ')}`);
    } else {
      addFinding('passes', '.env.local appears to define all required keys');
    }
  } else {
    addFinding('warnings', '.env.local not found (runtime may fail locally without it)');
  }

  const tsFiles = collectFiles('.', (rel) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel) && !rel.includes('node_modules/'));
  const referencedEnvKeys = new Set();

  for (const file of tsFiles) {
    const text = safeRead(file);
    if (!text) continue;
    extractEnvReferences(text).forEach((key) => referencedEnvKeys.add(key));
  }

  const envAliasKeys = new Set(['API_KEY']);

  for (const key of [...referencedEnvKeys].sort()) {
    if (!declaredEnvKeys.has(key) && !['NODE_ENV'].includes(key) && !envAliasKeys.has(key)) {
      addFinding('warnings', `Env key used in code but missing from examples: ${key}`);
    }
  }

  const firebaseConfig = safeRead('firebase.ts');
  if (firebaseConfig) {
    if (firebaseConfig.includes('initializeApp')) {
      addFinding('passes', 'Firebase app initialization found');
    } else {
      addFinding('errors', 'Firebase config exists but initializeApp call not found');
    }

    if (firebaseConfig.includes('getAuth')) {
      addFinding('passes', 'Firebase Auth initialization found');
    } else {
      addFinding('warnings', 'Firebase Auth initialization not found in firebase.ts');
    }
  }

  const geminiUsageFiles = collectFiles('.', (rel) => {
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel)) return false;
    return true;
  }).filter((file) => {
    const text = safeRead(file);
    if (!text) return false;
    return text.includes('GoogleGenAI') || text.includes('@google/genai');
  });

  const apiFile = safeRead('services/api.ts');
  if (geminiUsageFiles.length > 0) {
    addFinding('passes', `Gemini client usage detected in: ${geminiUsageFiles.join(', ')}`);
  } else {
    addFinding('warnings', 'Gemini client usage not detected in source files');
  }

  if (apiFile) {

    if (!apiFile.includes('try {')) {
      addFinding('warnings', 'services/api.ts may need stronger error handling (few try/catch blocks found)');
    }
  }

  const firestoreRules = safeRead('firestore.rules');
  if (firestoreRules) {
    if (firestoreRules.includes('allow read, write: if false')) {
      addFinding('warnings', 'Firestore rules are fully locked. Good for safety, but app will not read/write until rules are updated.');
    }
    if (firestoreRules.includes('allow read, write: if true')) {
      addFinding('errors', 'Firestore rules allow full public access. Lock this down before production.');
    }
  }

  const allTextFiles = collectFiles('.', (rel) => {
    if (rel.startsWith('.git/')) return false;
    if (rel.startsWith('node_modules/')) return false;
    if (rel.startsWith('dist/')) return false;
    return /\.(md|ts|tsx|js|jsx|json|mjs|cjs|sh)$/.test(rel);
  });

  const todoHits = [];
  for (const file of allTextFiles) {
    const text = safeRead(file);
    if (!text) continue;
    if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(text)) {
      todoHits.push(file);
    }
  }

  if (todoHits.length > 0) {
    addFinding('todos', `Action markers found in: ${todoHits.join(', ')}`);
  } else {
    addFinding('passes', 'No TODO/FIXME/HACK/XXX markers found in scanned files');
  }

  const lintResult = runCommand('npm run lint');
  if (lintResult.ok) {
    addFinding('passes', 'TypeScript/lint check passed (npm run lint)');
  } else {
    addFinding('warnings', `npm run lint failed: ${lintResult.output.split('\n').slice(-3).join(' | ')}`);
  }

  const buildResult = runCommand('npm run build');
  if (buildResult.ok) {
    addFinding('passes', 'Production build passed (npm run build)');
  } else {
    addFinding('warnings', `npm run build failed: ${buildResult.output.split('\n').slice(-3).join(' | ')}`);
  }

  const gitStatus = runCommand('git status --short');
  if (gitStatus.ok) {
    if (gitStatus.output.length === 0) {
      addFinding('passes', 'Git working tree is clean');
    } else {
      addFinding('todos', `Repository has uncommitted changes:\n${gitStatus.output}`);
    }
  }

  const recentCommits = runCommand('git log --pretty=format:"%h %ad %s" --date=short -n 8');

  const lines = [];
  lines.push('# Codex Repository Status Report');
  lines.push('');
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## 1) Current Status');
  lines.push('');
  lines.push(`- ✅ Pass checks: ${checks.passes.length}`);
  lines.push(`- ⚠️ Warnings: ${checks.warnings.length}`);
  lines.push(`- ❌ Errors: ${checks.errors.length}`);
  lines.push(`- 📝 Remaining tasks: ${checks.todos.length}`);
  lines.push('');
  lines.push('### Passes');
  checks.passes.forEach((item) => lines.push(`- ${item}`));

  lines.push('');
  lines.push('## 2) Diagnosis');
  lines.push('');

  if (checks.errors.length === 0 && checks.warnings.length === 0) {
    lines.push('- No major diagnosis findings. Repository appears healthy for the checks performed.');
  } else {
    if (checks.errors.length > 0) {
      lines.push('### Critical Issues');
      checks.errors.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
    if (checks.warnings.length > 0) {
      lines.push('### Warnings');
      checks.warnings.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
  }

  lines.push('## 3) What Is Left To Do');
  lines.push('');

  if (checks.todos.length === 0 && checks.errors.length === 0 && checks.warnings.length === 0) {
    lines.push('- No immediate tasks from this analyzer. Next step: manual feature QA and deployment smoke test.');
  } else {
    checks.errors.forEach((issue) => lines.push(`- [ ] Fix critical issue: ${issue}`));
    checks.warnings.forEach((warning) => lines.push(`- [ ] Resolve warning: ${warning}`));
    checks.todos.forEach((todo) => lines.push(`- [ ] Follow up: ${todo}`));
  }

  lines.push('');
  lines.push('## 4) Recent Git Activity');
  lines.push('');

  if (recentCommits.ok && recentCommits.output) {
    recentCommits.output.split('\n').forEach((entry) => lines.push(`- ${entry}`));
  } else {
    lines.push('- Could not read git history in this environment.');
  }

  lines.push('');
  lines.push('## 5) Handoff Note for Winser/Replit');
  lines.push('');
  lines.push('- Use this report to prioritize fixes in this order: Critical Issues → Warnings → Remaining Tasks.');
  lines.push('- After each milestone, run `npm run codex:analyze` to regenerate this report and track progress.');
  lines.push('- Re-run a full smoke test (`npm run dev`, sign in, browse core flows) before deployment.');
  lines.push('');

  fs.writeFileSync(REPORT_PATH, `${lines.join('\n')}\n`);
  console.log(`Saved report to ${path.relative(ROOT, REPORT_PATH)}`);

  const summary = [
    `Passes: ${checks.passes.length}`,
    `Warnings: ${checks.warnings.length}`,
    `Errors: ${checks.errors.length}`,
    `Todos: ${checks.todos.length}`,
  ].join(' | ');

  console.log(summary);
}

run();
