import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/src/types/database';

const supabaseUrl = 'https://twxxjqitqglidxqckumr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eHhqcWl0cWdsaWR4cWNrdW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDQ0MzcsImV4cCI6MjA4MzkyMDQzN30.tCJ-24btkW1lWMGDH97eMYvIfeBLuCTkucsJIMwvT3o';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
