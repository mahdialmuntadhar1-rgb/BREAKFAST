type Session = {
  access_token: string;
  refresh_token?: string;
  user?: { id: string; email?: string; user_metadata?: Record<string, any> };
};

type AuthChangeCallback = (event: string, session: Session | null) => void;

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const storageKey = 'iraq-compass-supabase-session';

const headers = (token?: string) => ({
  apikey: anonKey || '',
  Authorization: `Bearer ${token || anonKey || ''}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
});

const getSession = (): Session | null => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try { return JSON.parse(raw) as Session; } catch { return null; }
};

const setSession = (session: Session | null) => {
  if (session) localStorage.setItem(storageKey, JSON.stringify(session));
  else localStorage.removeItem(storageKey);
};

class QueryBuilder {
  private filters: string[] = [];
  private orderBy?: string;
  private orderAscending = true;
  private rangeStart?: number;
  private rangeEnd?: number;
  private payload: any;
  private method: 'GET' | 'POST' | 'PATCH' = 'GET';
  private selectCols = '*';
  private singleMode: 'single' | 'maybeSingle' | null = null;

  constructor(private table: string) {}

  select(cols = '*') { this.selectCols = cols; return this; }
  eq(column: string, value: string | boolean | number) { this.filters.push(`${column}=eq.${encodeURIComponent(String(value))}`); return this; }
  ilike(column: string, value: string) { this.filters.push(`${column}=ilike.${encodeURIComponent(value)}`); return this; }
  order(column: string, opts?: { ascending?: boolean }) { this.orderBy = column; this.orderAscending = opts?.ascending ?? true; return this; }
  range(start: number, end: number) { this.rangeStart = start; this.rangeEnd = end; return this; }
  limit(count: number) { this.rangeStart = 0; this.rangeEnd = count - 1; return this; }
  insert(payload: any) { this.method = 'POST'; this.payload = payload; return this; }
  update(payload: any) { this.method = 'PATCH'; this.payload = payload; return this; }
  upsert(payload: any, _opts?: any) { this.method = 'POST'; this.payload = payload; return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybeSingle'; return this; }

  async execute() {
    if (!url) return { data: null, error: new Error('Missing VITE_SUPABASE_URL') };

    const params: string[] = [`select=${encodeURIComponent(this.selectCols)}`, ...this.filters];
    if (this.orderBy) params.push(`order=${this.orderBy}.${this.orderAscending ? 'asc' : 'desc'}`);

    const query = params.join('&');
    const endpoint = `${url}/rest/v1/${this.table}${query ? `?${query}` : ''}`;

    const token = getSession()?.access_token;
    const response = await fetch(endpoint, {
      method: this.method,
      headers: headers(token),
      body: this.method === 'GET' ? undefined : JSON.stringify(this.payload)
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : null;

    if (!response.ok) return { data: null, error: new Error(json?.message || 'Supabase request failed') };

    let data = json;
    if (this.singleMode) {
      data = Array.isArray(json) ? (json[0] ?? null) : json;
      if (this.singleMode === 'single' && !data) return { data: null, error: new Error('No rows returned') };
    }

    return { data, error: null };
  }
}

const authListeners = new Set<AuthChangeCallback>();

const emitAuth = (event: string, session: Session | null) => {
  authListeners.forEach((cb) => cb(event, session));
};

export const supabase = {
  from(table: string) { return new QueryBuilder(table); },
  channel(_name: string) {
    return {
      on: () => this,
      subscribe: () => ({})
    } as any;
  },
  removeChannel: (_channel: any) => {},
  auth: {
    onAuthStateChange(callback: AuthChangeCallback) {
      authListeners.add(callback);
      callback('INITIAL_SESSION', getSession());
      const onStorage = () => callback('TOKEN_CHANGED', getSession());
      window.addEventListener('storage', onStorage);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
              window.removeEventListener('storage', onStorage);
            }
          }
        }
      };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) return { data: null, error: new Error(data?.error_description || 'Sign-in failed') };
      setSession(data);
      emitAuth('SIGNED_IN', data);
      return { data, error: null };
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
      const response = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password, data: options?.data, email_redirect_to: options?.emailRedirectTo })
      });
      const data = await response.json();
      if (!response.ok) return { data: null, error: new Error(data?.msg || 'Sign-up failed') };
      if (data.access_token) {
        setSession(data);
        emitAuth('SIGNED_IN', data);
      }
      return { data, error: null };
    },

    async signInWithOAuth({ provider, options }: { provider: string; options?: { redirectTo?: string } }) {
      const redirectTo = options?.redirectTo || window.location.origin;
      const oauthUrl = `${url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
      window.location.assign(oauthUrl);
      return { data: null, error: null };
    },

    async signOut() {
      setSession(null);
      emitAuth('SIGNED_OUT', null);
      return { error: null };
    }
  }
};

export type SupabaseAuthUser = NonNullable<Session['user']>;
