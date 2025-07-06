import { getProfile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/stores/useProfileStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AppLayout() {
  const { profile, setProfile } = useProfileStore();
  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error("Failed to load profile 2", err));
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    const profile_channel = supabase
      .channel(`profile_changes_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          // When the profile changes in the DB, update the central store
          console.log('Profile updated from database:', payload.new);
          setProfile(payload.new);
        }
      )
      .subscribe();
    //console.log(`Subscribed to profile changes for ${profile.id}`);
    // Cleanup the subscription when the app closes
    return () => {
      console.log("Unsubscribing from profile changes");
      profile_channel.unsubscribe();
    };
  }, [profile?.id]); // Re-run if the user logs in/out
  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
