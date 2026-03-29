type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

interface Session {
  access_token: string;
  refresh_token?: string;
  user: SupabaseAuthUser;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

const SESSION_KEY = 'iraq_compass_supabase_session';
const listeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

const getStoredSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Session; } catch { return null; }
};

const setStoredSession = (session: Session | null) => {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const notify = (event: AuthChangeEvent, session: Session | null) => {
  listeners.forEach((listener) => listener(event, session));
};

const authHeaders = (token?: string) => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${token ?? supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

const qs = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
};

const restSelect = async (table: string, options: { select?: string; filters?: string[]; order?: { column: string; ascending?: boolean }; range?: { from: number; to: number }; token?: string; single?: boolean } = {}) => {
  const queryParts: string[] = [];
  queryParts.push(`select=${encodeURIComponent(options.select ?? '*')}`);
  for (const filter of options.filters ?? []) queryParts.push(filter);
  if (options.order) queryParts.push(`order=${options.order.column}.${options.order.ascending === false ? 'desc' : 'asc'}`);

  const headers: Record<string, string> = authHeaders(options.token);
  if (options.range) headers.Range = `${options.range.from}-${options.range.to}`;

  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${queryParts.join('&')}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Supabase query failed');
  if (options.single) return data?.[0] ?? null;
  return data;
};

const restInsert = async (table: string, payload: any, options: { token?: string; upsert?: boolean; single?: boolean } = {}) => {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...authHeaders(options.token),
      Prefer: `${options.upsert ? 'resolution=merge-duplicates,' : ''}return=representation${options.single ? ',plurality=singular' : ''}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Supabase insert failed');
  return data;
};

const restUpdate = async (table: string, payload: any, filters: string[], token?: string) => {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${filters.join('&')}`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Supabase update failed');
  return data;
};

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: getStoredSession() }, error: null };
    },
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.error_description || data.msg || 'Invalid login credentials') };
      const session: Session = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
      setStoredSession(session);
      notify('SIGNED_IN', session);
      return { error: null };
    },
    async signUp({ email, password }: { email: string; password: string }) {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) return { error: new Error(data.msg || 'Signup failed') };
      if (data.access_token && data.user) {
        const session: Session = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user };
        setStoredSession(session);
        notify('SIGNED_IN', session);
      }
      return { error: null };
    },
    async signInWithOAuth({ provider }: { provider: 'google' }) {
      const redirectTo = window.location.origin;
      window.location.href = `${supabaseUrl}/auth/v1/authorize${qs({ provider, redirect_to: redirectTo })}`;
      return { error: null };
    },
    async signOut() {
      const session = getStoredSession();
      if (session?.access_token) {
        await fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: authHeaders(session.access_token) });
      }
      setStoredSession(null);
      notify('SIGNED_OUT', null);
      return { error: null };
    },
  },
  db: { select: restSelect, insert: restInsert, update: restUpdate },
};
