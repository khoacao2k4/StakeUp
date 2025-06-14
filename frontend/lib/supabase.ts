import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'

const supabaseProjectId = "ohuuuqulmptjbliexejn"
const supabaseUrl = `https://${supabaseProjectId}.supabase.co`
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9odXV1cXVsbXB0amJsaWV4ZWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2Nzk2NDEsImV4cCI6MjA2NTI1NTY0MX0.NWgOvhFRKHwZoa6lDqXhDsd_ZkvbHL5mYDNlXoWSzGo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})


export const getToken = async () => {
  const storageKey = `sb-${supabaseProjectId}-auth-token`;
  const sessionDataString = await AsyncStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  const token = sessionData?.access_token;

  return token;
};


// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})