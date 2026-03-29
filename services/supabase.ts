export type SupabaseSessionUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
};

const STORAGE_KEY = 'iraq-compass-supabase-session';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

type SessionPayload = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: SupabaseSessionUser;
};

type Listener = (event: string, session: SessionPayload | null) => void;
const listeners = new Set<Listener>();

const readSession = (): SessionPayload | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
};

const writeSession = (session: SessionPayload | null, event: string) => {
  if (!session) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  listeners.forEach((listener) => listener(event, session));
};


const readSessionFromUrl = () => {
  if (!window.location.hash.includes('access_token')) return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token') || undefined;
  const expires_in = Number(params.get('expires_in') || 0);
  const userRaw = params.get('user');
  if (!access_token) return;
  let user: SupabaseSessionUser = { id: params.get('user_id') || 'unknown' };
  if (userRaw) {
    try { user = JSON.parse(decodeURIComponent(userRaw)); } catch {}
  }
  writeSession({ access_token, refresh_token, expires_at: Date.now() + expires_in * 1000, user }, 'SIGNED_IN');
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
};

readSessionFromUrl();

const authHeaders = (token?: string) => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${token ?? supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: readSession() }, error: null };
    },

    onAuthStateChange(callback: Listener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error_description || data.msg || 'Sign in failed.' } };
      writeSession(data, 'SIGNED_IN');
      return { data, error: null };
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email, password, data: options?.data, email_redirect_to: options?.emailRedirectTo }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error_description || data.msg || 'Sign up failed.' } };
      if (data.access_token) writeSession(data, 'SIGNED_IN');
      return { data, error: null };
    },

    async signInWithOAuth({ provider, options }: { provider: string; options?: any }) {
      const redirectTo = encodeURIComponent(options?.redirectTo || window.location.origin);
      window.location.assign(`${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`);
      return { data: null, error: null };
    },

    async signOut() {
      const session = readSession();
      if (session?.access_token) {
        await fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: authHeaders(session.access_token) });
      }
      writeSession(null, 'SIGNED_OUT');
      return { error: null };
    },
  },

  async from(table: string, query = '', options: RequestInit = {}) {
    const session = readSession();
    const separator = query ? `?${query}` : '';
    return fetch(`${supabaseUrl}/rest/v1/${table}${separator}`, {
      ...options,
      headers: {
        ...authHeaders(session?.access_token),
        ...options.headers,
      },
    });
  },
};
