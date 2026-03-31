import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl)     throw new Error('FATAL: NEXT_PUBLIC_SUPABASE_URL is not defined.');
if (!supabaseAnonKey) throw new Error('FATAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.');

// createBrowserClient stores auth in cookies (accessible server-side) instead of localStorage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
