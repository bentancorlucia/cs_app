import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/src/types/database';

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://twxxjqitqglidxqckumr.supabase.co';
const supabaseAnonKey = 'sb_publishable_yHgEj-cx1i-MP26wsX-Zow_Bx0A58us';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
