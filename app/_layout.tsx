import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [init, setInit] = useState(true);
  const segments = useSegments();
  const onAuthStateChanged = (user) => { 
    console.log('onAuthStateChanged', user);
    setUser(user);
    if (init) setInit(false);
  };

  useEffect(() => {
    const subscriber = getAuth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [])

  useEffect(() => {
    if (init) return;
    const accessApp = segments[0] === '(app)';
    if (user && !accessApp) { // user is signed in and wants to access app
      router.replace('/(app)/home');
    } else if (!user && accessApp) { // user is not signed in and wants to access app
      router.replace('/');
    } 

    SplashScreen.hideAsync();
  }, [user, init]);

  if (init) return null;
  
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
  </Stack>;
}
