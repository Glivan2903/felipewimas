import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseUrl !== 'coloque_sua_url_aqui' && 
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== 'coloque_sua_anon_key_aqui';

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
