type AuthSession = { user: any } | null;
type AuthListener = (_event: string, session: AuthSession) => void;

class QueryBuilder {
  private table: string;
  private rows: any[] = [];

  constructor(table: string) {
    this.table = table;
    this.rows = JSON.parse(localStorage.getItem(`supabase:${table}`) || '[]');
  }

  select(..._args: any[]) { return this; }
  order(..._args: any[]) { return this; }
  eq(..._args: any[]) { return this; }
  ilike(..._args: any[]) { return this; }
  range(from: number, to: number) {
    const data = this.rows.slice(from, to + 1);
    return Promise.resolve({ data, error: null, count: this.rows.length });
  }
  limit(count: number) {
    const data = this.rows.slice(0, count);
    return Promise.resolve({ data, error: null, count: this.rows.length });
  }
  maybeSingle() {
    return Promise.resolve({ data: this.rows[0] || null, error: null });
  }
  single() {
    return Promise.resolve({ data: this.rows[0] || null, error: null });
  }
  insert(payload: any) {
    const arr = Array.isArray(payload) ? payload : [payload];
    const rows = arr.map((item) => ({ id: item.id || crypto.randomUUID(), ...item }));
    this.rows = [...this.rows, ...rows];
    localStorage.setItem(`supabase:${this.table}`, JSON.stringify(this.rows));
    const response = { data: rows[0], error: null as any };
    return {
      ...response,
      select: (..._args: any[]) => ({ single: () => Promise.resolve(response) }),
      single: () => Promise.resolve(response),
    };
  }
  upsert(payload: any, _options?: any) {
    const item = { id: payload.id || crypto.randomUUID(), ...payload };
    const idx = this.rows.findIndex((r) => r.id === item.id);
    if (idx >= 0) this.rows[idx] = { ...this.rows[idx], ...item };
    else this.rows.push(item);
    localStorage.setItem(`supabase:${this.table}`, JSON.stringify(this.rows));
    return { select: (..._args: any[]) => ({ single: () => Promise.resolve({ data: item, error: null }) }) };
  }
  update(payload: any) {
    return {
      eq: (_field: string, value: string) => {
        this.rows = this.rows.map((row) => (row.id === value ? { ...row, ...payload } : row));
        localStorage.setItem(`supabase:${this.table}`, JSON.stringify(this.rows));
        return Promise.resolve({ error: null });
      },
    };
  }
}

const authListeners = new Set<AuthListener>();

const getSessionData = () => {
  const user = localStorage.getItem('supabase:session:user');
  return user ? { user: JSON.parse(user) } : null;
};

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  channel(..._args: any[]) {
    return { on: (..._args2: any[]) => ({ subscribe: () => ({}) }) };
  },
  removeChannel(..._args: any[]) {},
  auth: {
    onAuthStateChange(callback: AuthListener) {
      authListeners.add(callback);
      return { data: { subscription: { unsubscribe: () => authListeners.delete(callback) } } };
    },
    async getSession() {
      return { data: { session: getSessionData() } };
    },
    async signOut() {
      localStorage.removeItem('supabase:session:user');
      authListeners.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },
    async signInWithOAuth(_payload?: any) {
      return { error: null };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      const user = { id: crypto.randomUUID(), email, user_metadata: {} };
      localStorage.setItem('supabase:session:user', JSON.stringify(user));
      authListeners.forEach((cb) => cb('SIGNED_IN', { user }));
      return { data: { user }, error: null };
    },
    async signUp({ email }: { email: string; password: string; options?: any }) {
      const user = { id: crypto.randomUUID(), email, user_metadata: {} };
      localStorage.setItem('supabase:session:user', JSON.stringify(user));
      authListeners.forEach((cb) => cb('SIGNED_IN', { user }));
      return { data: { user }, error: null };
    },
  },
};
