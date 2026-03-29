type SessionUser = { id: string; email?: string; user_metadata?: Record<string, any> };
type Session = { access_token: string; refresh_token?: string; user: SessionUser };
type AuthListener = (_event: string, session: Session | null) => void;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const SESSION_KEY = 'iraq-compass-supabase-session';
const listeners = new Set<AuthListener>();

const getStoredSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Session; } catch { return null; }
};

const setStoredSession = (session: Session | null) => {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  listeners.forEach((cb) => cb('SIGNED_IN', session));
};

const authHeaders = (token?: string) => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${token || supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

async function authedFetch(path: string, token?: string, init?: RequestInit) {
  const res = await fetch(`${supabaseUrl}${path}`, { ...init, headers: { ...authHeaders(token), ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res;
}

async function signInWithPassword(email: string, password: string) {
  const res = await authedFetch('/auth/v1/token?grant_type=password', undefined, { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json();
  const session: Session = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
  setStoredSession(session);
  return { data: { session }, error: null };
}

async function signUp(email: string, password: string) {
  const res = await authedFetch('/auth/v1/signup', undefined, { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (data.access_token && data.user) setStoredSession({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });
  return { data, error: null };
}

async function signOut() { setStoredSession(null); return { error: null }; }

function onAuthStateChange(callback: AuthListener) {
  listeners.add(callback);
  return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
}

async function getSession() { return { data: { session: getStoredSession() }, error: null }; }

function signInWithOAuth({ provider }: { provider: 'google' }) {
  const redirectTo = window.location.origin;
  const url = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
  window.location.href = url;
  return Promise.resolve({ data: null, error: null });
}

const from = (table: string) => {
  const session = getStoredSession();
  let filters: string[] = [];
  let orderBy = '';
  let rangeStart: number | null = null;
  let rangeEnd: number | null = null;

  const builder: any = {
    select() { return builder; },
    eq(column: string, value: any) { filters.push(`${column}=eq.${encodeURIComponent(value)}`); return builder; },
    ilike(column: string, value: string) { filters.push(`${column}=ilike.${encodeURIComponent(value)}`); return builder; },
    order(column: string, options?: { ascending?: boolean }) { orderBy = `order=${column}.${options?.ascending === false ? 'desc' : 'asc'}`; return builder; },
    range(start: number, end: number) { rangeStart = start; rangeEnd = end; return builder.execute(); },
    async maybeSingle() { const rows = await builder.execute(); return { data: rows[0] ?? null, error: null }; },
    async single() { const rows = await builder.execute(); if (!rows[0]) throw new Error('No row found'); return { data: rows[0], error: null }; },
    async insert(payload: any) { const res = await authedFetch(`/rest/v1/${table}`, session?.access_token, { method: 'POST', headers: { Prefer: 'return=representation', ...authHeaders(session?.access_token) }, body: JSON.stringify(payload) }); const data = await res.json(); return { select: () => ({ single: async () => ({ data: data[0], error: null }) }) }; },
    async update(payload: any) { builder._updatePayload = payload; builder._method = 'PATCH'; return builder; },
    async upsert(payload: any) { const res = await authedFetch(`/rest/v1/${table}`, session?.access_token, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation', ...authHeaders(session?.access_token) }, body: JSON.stringify(payload) }); const data = await res.json(); return { select: () => ({ single: async () => ({ data: data[0], error: null }) }) }; },
    async execute() {
      const query = [orderBy, ...filters].filter(Boolean).join('&');
      const rangeHeader = rangeStart !== null && rangeEnd !== null ? { Range: `${rangeStart}-${rangeEnd}` } : {};
      if ((builder as any)._method === 'PATCH') {
        const res = await authedFetch(`/rest/v1/${table}?${query}`, session?.access_token, { method: 'PATCH', headers: { Prefer: 'return=minimal', ...authHeaders(session?.access_token) }, body: JSON.stringify((builder as any)._updatePayload) });
        await res.text();
        return { error: null };
      }
      const res = await authedFetch(`/rest/v1/${table}?select=*&${query}`, session?.access_token, { headers: { ...rangeHeader } });
      return res.json();
    },
  };
  return builder;
};

export const supabase = { auth: { getSession, onAuthStateChange, signOut, signInWithOAuth, signUp, signInWithPassword }, from };
