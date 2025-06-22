import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // your configured supabase client
import { Profile } from "@/app/(app)/(tabs)/profile";
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAvatarUrl(profile: Profile | null) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // No avatar -> no URL
    if (!profile?.avatar_path) {
      setAvatarUrl(null);
      return;
    }

    const key = `avatar-${profile.avatar_path}`;

    const loadAvatarUrl = async () => {
      try {
        const cached = await AsyncStorage.getItem(key);

        if (cached) {
          const { url, expiresAt } = JSON.parse(cached);
          if (Date.now() < expiresAt) {
            setAvatarUrl(url);
            return; // use cached version
          }
        }

        // No cached or expired -> get new signed URL
        const { data, error } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profile.avatar_path!, 60 * 60); // 1 hour

        if (error) {
          console.error("Error creating signed URL:", error.message);
          return;
        }

        const url = data.signedUrl;
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour from now

        await AsyncStorage.setItem(
          key,
          JSON.stringify({ url, expiresAt })
        );

        setAvatarUrl(url);
      } catch (err) {
        console.error("Error loading avatar URL:", err);
      }
    };

    loadAvatarUrl();
  }, [profile?.avatar_path]);

  return avatarUrl;
}
