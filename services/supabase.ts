type Filter = { column: string; op: 'eq' | 'ilike'; value: string | number | boolean };
type Order = { column: string; ascending: boolean };

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

const headers = (jwt?: string) => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${jwt || localStorage.getItem('supabase_access_token') || supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

class QueryBuilder {
  private filters: Filter[] = [];
  private orderBy?: Order;
  private fromIdx?: number;
  private toIdx?: number;

  constructor(private table: string) {}

  select(_columns = '*', _opts?: { count?: 'exact' }) { return this; }
  eq(column: string, value: string | number | boolean) { this.filters.push({ column, op: 'eq', value }); return this; }
  ilike(column: string, value: string) { this.filters.push({ column, op: 'ilike', value }); return this; }
  order(column: string, opts?: { ascending?: boolean }) { this.orderBy = { column, ascending: opts?.ascending ?? true }; return this; }
  range(from: number, to: number) { this.fromIdx = from; this.toIdx = to; return this.exec(); }

  async maybeSingle() { const r = await this.exec(); return { ...r, data: (r.data as any[])?.[0] ?? null }; }
  async single() { const r = await this.exec(); return { ...r, data: (r.data as any[])?.[0] ?? null }; }

  async insert(payload: any) { return this.write('POST', payload); }
  async update(payload: any) { return this.write('PATCH', payload); }
  async upsert(payload: any, _opts?: { onConflict?: string }) { return this.write('POST', payload, true); }

  private async write(method: string, payload: any, merge = false) {
    const url = new URL(`${supabaseUrl}/rest/v1/${this.table}`);
    this.applyFilters(url);
    const res = await fetch(url.toString(), {
      method,
      headers: { ...headers(), Prefer: merge ? 'resolution=merge-duplicates,return=representation' : 'return=representation' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return { data, error: res.ok ? null : data, count: Array.isArray(data) ? data.length : null };
  }

  async exec() {
    const url = new URL(`${supabaseUrl}/rest/v1/${this.table}`);
    url.searchParams.set('select', '*');
    this.applyFilters(url);
    if (this.orderBy) url.searchParams.set('order', `${this.orderBy.column}.${this.orderBy.ascending ? 'asc' : 'desc'}`);
    if (typeof this.fromIdx === 'number' && typeof this.toIdx === 'number') url.searchParams.set('limit', String(this.toIdx - this.fromIdx + 1)), url.searchParams.set('offset', String(this.fromIdx));
    const res = await fetch(url.toString(), { headers: headers() });
    const data = await res.json().catch(() => null);
    return { data: Array.isArray(data) ? data : [], error: res.ok ? null : data, count: Array.isArray(data) ? data.length : null };
  }

  then(resolve: any, reject: any) { return this.exec().then(resolve, reject); }

  private applyFilters(url: URL) {
    for (const f of this.filters) {
      const encoded = f.op === 'ilike' ? `ilike.${f.value}` : `eq.${f.value}`;
      url.searchParams.set(f.column, encoded);
    }
  }
}

const auth = {
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const listener = () => callback('TOKEN_CHANGED', auth.getStoredSession());
    window.addEventListener('storage', listener);
    return { data: { subscription: { unsubscribe: () => window.removeEventListener('storage', listener) } } };
  },
  async getSession() { return { data: { session: auth.getStoredSession() } }; },
  async signOut() { localStorage.removeItem('supabase_access_token'); localStorage.removeItem('supabase_user'); return { error: null }; },
  async signInWithOAuth({ provider, options }: { provider: 'google'; options: { redirectTo: string } }) {
    const url = `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(options.redirectTo)}`;
    window.location.href = url;
    return { error: null };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (res.ok) auth.storeSession(data);
    return { data, error: res.ok ? null : data };
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown>; emailRedirectTo?: string } }) {
    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password, data: options?.data }) });
    const data = await res.json();
    if (res.ok && data.access_token) auth.storeSession(data);
    return { data, error: res.ok ? null : data };
  },
  getStoredSession() {
    const token = localStorage.getItem('supabase_access_token');
    const user = localStorage.getItem('supabase_user');
    if (!token || !user) return null;
    return { access_token: token, user: JSON.parse(user) };
  },
  storeSession(data: any) {
    if (data?.access_token) localStorage.setItem('supabase_access_token', data.access_token);
    if (data?.user) localStorage.setItem('supabase_user', JSON.stringify(data.user));
    window.dispatchEvent(new StorageEvent('storage'));
  },
};

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  auth,
  channel: (_name: string) => ({ on: (_event: string, _filter: any, _cb: () => void) => ({ subscribe: () => ({}) }) }),
  removeChannel: async (_channel: unknown) => {},
};

export type SupabaseAuthUser = { id: string; email?: string; user_metadata?: Record<string, any> };
