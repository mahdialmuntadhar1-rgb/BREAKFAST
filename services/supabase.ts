const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const AUTH_STORAGE_KEY = 'iraq-compass-supabase-session';

type Session = { access_token: string; refresh_token?: string; user: any };
type AuthListener = (event: 'SIGNED_IN' | 'SIGNED_OUT', session: Session | null) => void;
const listeners = new Set<AuthListener>();

const baseHeaders = () => ({ apikey: supabaseAnonKey || '', Authorization: `Bearer ${getAccessToken() || supabaseAnonKey || ''}` });

const getStoredSession = (): Session | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const persistSession = (session: Session | null) => {
  if (!session) localStorage.removeItem(AUTH_STORAGE_KEY);
  else localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const getAccessToken = () => getStoredSession()?.access_token;

const notify = (event: 'SIGNED_IN' | 'SIGNED_OUT', session: Session | null) => listeners.forEach((cb) => cb(event, session));

const auth = {
  async getSession() {
    return { data: { session: getStoredSession() } };
  },
  onAuthStateChange(callback: AuthListener) {
    listeners.add(callback);
    return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey || '' }, body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) return { error: new Error(json.error_description || json.msg || 'Sign in failed') };
    const session: Session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
    persistSession(session);
    notify('SIGNED_IN', session);
    return { error: null };
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey || '' }, body: JSON.stringify({ email, password, data: options?.data, email_redirect_to: options?.emailRedirectTo }),
    });
    const json = await res.json();
    if (!res.ok) return { error: new Error(json.msg || 'Sign up failed') };
    if (json.access_token) {
      const session: Session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
      persistSession(session);
      notify('SIGNED_IN', session);
    }
    return { error: null };
  },
  async signInWithOAuth({ provider }: { provider: string; options?: any }) {
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(window.location.origin)}`;
    return { error: null };
  },
  async signOut() {
    persistSession(null);
    notify('SIGNED_OUT', null);
    return { error: null };
  },
};

const rest = async (table: string, method: string, { query = '', body }: { query?: string; body?: any } = {}) => {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}${query}`, {
    method,
    headers: { ...baseHeaders(), 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `Supabase request failed: ${table}`);
  return json;
};

export const supabase = { auth, rest };
