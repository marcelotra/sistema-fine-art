import { createClient } from '@supabase/supabase-js';

// Access environment variables
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env or Vercel project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn(
        'Supabase URL or Key is missing! Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
    );
}

// Create Supabase client
export const supabase = createClient(
    supabaseUrl || '',
    supabaseKey || ''
);
