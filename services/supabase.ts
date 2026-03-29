import { createClient } from './supabaseClient';
import { env, supabaseConfigError } from './env';

export { supabaseConfigError };
export const supabaseReady = !supabaseConfigError;

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
