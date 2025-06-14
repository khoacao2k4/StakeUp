import { router, Slot, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Session } from '@supabase/supabase-js'
import { supabase } from "../lib/supabase";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [init, setInit] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (init) setInit(false);
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (init) setInit(false);
    })
  }, [])

  useEffect(() => {
    if (init) return;
    const accessApp = segments[0] === '(app)';
    if (session && !accessApp) { // user is signed in and wants to access app
      router.replace('/(app)/home');
    } else if (!session) {
      router.replace('/(auth)/onboarding');
    } 
    // Delay hiding splash by a short amount to ensure routing is complete
    const t = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 250);

    return () => clearTimeout(t);
  }, [session, init]);

  if (init) return null;
  
  return <Stack screenOptions={{ headerShown: false }} />
}
