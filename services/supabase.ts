const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (isSupabaseConfigured) {
  console.info('Supabase connected');
} else {
  console.info('Supabase fallback active');
}

export interface SupabaseQueryOptions {
  select?: string;
  filters?: string[];
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
}

function buildQueryString(options: SupabaseQueryOptions = {}) {
  const params = new URLSearchParams();
  params.set('select', options.select || '*');

  if (options.orderBy) {
    params.set('order', `${options.orderBy}.${options.ascending === false ? 'desc' : 'asc'}`);
  }

  if (typeof options.limit === 'number') {
    params.set('limit', String(options.limit));
  }

  if (typeof options.offset === 'number') {
    params.set('offset', String(options.offset));
  }

  for (const filter of options.filters || []) {
    const [key, value] = filter.split('=', 2);
    if (key && value !== undefined) params.append(key, value);
  }

  return params.toString();
}

export async function fetchSupabaseRows<T = any>(table: string, options: SupabaseQueryOptions = {}): Promise<T[]> {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured.');
  }

  const query = buildQueryString(options);
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact'
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase REST error (${response.status}): ${body}`);
  }

  return response.json();
}
