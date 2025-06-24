import { getProfile } from "@/lib/api";
import { useProfileStore } from "@/stores/useProfileStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function AppLayout() {
  const { profile, setProfile } = useProfileStore();
  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error("Failed to load profile", err));
  }, []);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </>
  );
}
