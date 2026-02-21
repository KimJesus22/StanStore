import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// createBrowserClient stores auth in cookies (accessible server-side) instead of localStorage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
