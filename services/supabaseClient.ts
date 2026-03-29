const listeners = new Set<(event: string, session: any) => void>();

const getSessionData = () => {
  const raw = localStorage.getItem('supabase.session');
  return raw ? JSON.parse(raw) : null;
};

const setSessionData = (session: any) => {
  if (session) localStorage.setItem('supabase.session', JSON.stringify(session));
  else localStorage.removeItem('supabase.session');
  listeners.forEach((cb) => cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
};

class QueryBuilder {
  private filters: string[] = [];
  private sort?: string;
  private pageRange?: [number, number];
  private method: 'GET' | 'POST' | 'PATCH' = 'GET';
  private body: unknown;
  private selectQuery = '*';
  private wantSingle = false;
  private wantMaybeSingle = false;
  private isUpsert = false;

  constructor(private readonly url: string, private readonly key: string, private readonly table: string) {}

  select(columns = '*') { this.selectQuery = columns; return this; }
  eq(k: string, v: string | boolean) { this.filters.push(`${k}=eq.${encodeURIComponent(String(v))}`); return this; }
  ilike(k: string, v: string) { this.filters.push(`${k}=ilike.${encodeURIComponent(v)}`); return this; }
  order(k: string, { ascending = true }: { ascending?: boolean } = {}) { this.sort = `${k}.${ascending ? 'asc' : 'desc'}`; return this; }
  range(from: number, to: number) { this.pageRange = [from, to]; return this; }
  insert(data: unknown) { this.method = 'POST'; this.body = data; return this; }
  update(data: unknown) { this.method = 'PATCH'; this.body = data; return this; }
  upsert(data: unknown) { this.method = 'POST'; this.body = data; this.isUpsert = true; return this; }
  single() { this.wantSingle = true; return this; }
  maybeSingle() { this.wantMaybeSingle = true; return this; }

  then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute() {
    const params = [`select=${encodeURIComponent(this.selectQuery)}`];
    if (this.sort) params.push(`order=${this.sort}`);
    if (this.filters.length) params.push(...this.filters);
    const endpoint = `${this.url}/rest/v1/${this.table}?${params.join('&')}`;

    const headers: Record<string, string> = {
      apikey: this.key,
      Authorization: `Bearer ${this.key}`,
      'Content-Type': 'application/json',
    };

    if (this.pageRange) {
      headers.Range = `${this.pageRange[0]}-${this.pageRange[1]}`;
      headers['Range-Unit'] = 'items';
    }

    if (this.method !== 'GET') {
      headers.Prefer = this.isUpsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation';
    }

    const response = await fetch(endpoint, {
      method: this.method,
      headers,
      body: this.body ? JSON.stringify(this.body) : undefined,
    });

    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;
    if (!response.ok) return { data: null, error: parsed ?? { message: 'Supabase request failed' } };

    if (this.wantSingle) return { data: Array.isArray(parsed) ? parsed[0] : parsed, error: null };
    if (this.wantMaybeSingle) return { data: Array.isArray(parsed) ? parsed[0] ?? null : parsed, error: null };
    return { data: parsed, error: null };
  }
}

export const createClient = (url: string, key: string) => ({
  from: (table: string) => new QueryBuilder(url, key, table),
  auth: {
    onAuthStateChange: (cb: (event: string, session: any) => void) => {
      listeners.add(cb);
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
    },
    getSession: async () => ({ data: { session: getSessionData() } }),
    signOut: async () => {
      setSessionData(null);
      return { error: null };
    },
    signInWithOAuth: async ({ provider, options }: { provider: string; options?: { redirectTo?: string } }) => {
      window.location.href = `${url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(options?.redirectTo ?? window.location.origin)}`;
      return { error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { data: null, error: data };
      const session = { access_token: data.access_token, user: data.user };
      setSessionData(session);
      return { data: { session, user: data.user }, error: null };
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: unknown } }) => {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, data: options?.data }),
      });
      const data = await res.json();
      if (!res.ok) return { data: null, error: data };
      if (data.access_token) setSessionData({ access_token: data.access_token, user: data.user });
      return { data, error: null };
    },
  },
  channel: (_name: string) => ({
    on: (_event: string, _filter: unknown, _cb: () => void) => ({ subscribe: () => ({}) }),
  }),
  removeChannel: async (_channel: unknown) => ({ _channel }),
});
