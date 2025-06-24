// stores/useProfileStore.ts
import { create } from 'zustand';
import { Profile } from '@/app/(app)/(tabs)/profile';

interface ProfileStore {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (p) => set({ profile: p }),
}));
