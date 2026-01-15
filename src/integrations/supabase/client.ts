import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ttmkznpfdjwygksspmjz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bWt6bnBmZGp3eWdrc3NwbWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzEwNzYsImV4cCI6MjA3NDc0NzA3Nn0.texvU7Iv4K2fDJaoBEebFOb5dna6xCq8M0XtopcMo94';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
