const readEnv = (key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_SITE_URL') => {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
};

export const env = {
  supabaseUrl: readEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_SUPABASE_ANON_KEY'),
  siteUrl: readEnv('VITE_SITE_URL'),
};

export const getSiteUrl = () => env.siteUrl || window.location.origin;

const missing = [
  !env.supabaseUrl ? 'VITE_SUPABASE_URL' : null,
  !env.supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter(Boolean) as string[];

export const supabaseConfigError = missing.length
  ? `Missing required environment variables: ${missing.join(', ')}`
  : null;
