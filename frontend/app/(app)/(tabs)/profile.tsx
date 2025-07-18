import { Feather } from "@expo/vector-icons";
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase"; // Make sure this path is correct
import { useCallback, useEffect, useState } from "react";
import { getProfile } from "@/lib/api";
import { useProfileStore } from "@/stores/useProfileStore";
import { router } from "expo-router";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import getWinRateColor from "@/utils/getWinRateColor";

export interface Profile {
  id?: number;
  username?: string;
  full_name?: string;
  avatar_path?: string;
  avatar_url?: string;
  coin_balance?: number;
  wins?: number;
  losses?: number;
}

export default function ProfileScreen() {
  const { profile, setProfile } = useProfileStore();
  const [loading, setLoading] = useState(true);
  const avatarUrl = useAvatarUrl(profile);
  const [refreshing, setRefreshing] = useState(false);
  
  const winRateVal = (() => {
    if (!profile || typeof profile.wins !== 'number' || typeof profile.losses !== 'number') {
      return null;
    }
    const totalSettled = profile.wins + profile.losses;
    if (totalSettled === 0) {
      return null; 
    }
    return (profile.wins / totalSettled) * 100;
  })();
  const winRateDisplay = winRateVal !== null ? `${winRateVal.toFixed(1)}%` : "N/A";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log("Refreshing profile...");
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile", err);
      Alert.alert("Error", "Could not refresh profile.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch the user's profile on initial load
  useEffect(() => {
    setLoading(true);
    onRefresh().finally(() => setLoading(false));
  }, [onRefresh]);

  // Sign the user out
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error signing out", error.message);
    }
    useAvatarUrl(null);
    setProfile(null);
  };

  const StatBox = ({ value, label, color = '#064E3B' }: { value: string | number; label: string; color?: string }) => (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ProfileButton = ({ icon, text, hasNav = false, onPress }: { icon: any; text: string; hasNav?: boolean; onPress?: () => void }) => (
    <TouchableOpacity style={[styles.row]} activeOpacity={hasNav ? 0.5 : 1} onPress={onPress}>
      <Feather name={icon} size={20} color="#064E3B" />
      <Text style={styles.rowText}>{text}</Text>
      <View style={{ flex: 1 }} />
      {hasNav && <Feather name="chevron-right" size={20} color="#059669" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      {/* content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#10B981" />}>
        {/* profile section */}
        <View style={styles.profileSection}>
          {loading ? (
            <View style={[styles.avatar, styles.placeholder]} />
          ) : (
            <Image
              source={avatarUrl || "https://placehold.co/200x200/ECFDF5/064E3B?text=User"}
              style={styles.avatar}
            />
          )}
          <Text style={styles.profileName}>{loading ? "" : profile?.full_name}</Text>
          <Text style={styles.profileHandle}>{loading ? "" : `@${profile?.username}`}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/edit-profile")} disabled={loading}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        {/* stats section */}
        <View style={styles.statsSection}>
          {loading ? (
            <>
              <View style={[styles.statBox, styles.placeholder]} />
              <View style={[styles.statBox, styles.placeholder]} />
              <View style={[styles.statBox, styles.placeholder]} />
            </>
          ) : (
            <>
              <StatBox value={winRateDisplay} label="Win Rate" color={getWinRateColor(winRateVal)}/>
              <StatBox value={profile?.wins || 0} label="Wins" />
              <StatBox value={profile?.losses || 0} label="Losses" />
            </>
          )}
        </View>
        {/* menu section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          {loading ? (
            <>
              <View style={[styles.row, styles.placeholder]} />
              <View style={[styles.row, styles.placeholder]} />
              <View style={[styles.row, styles.placeholder]} />
            </>
          ) : (
            <>
              <ProfileButton icon="dollar-sign" text={`Coin Balance: ${profile?.coin_balance}`} />
              <ProfileButton icon="clock" text="Bets History" hasNav onPress={() => router.push("/history")} />
              <ProfileButton icon="settings" text="Settings" hasNav />
            </>
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.row, { justifyContent: "center" }]}
            disabled={loading}
          >
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text style={[styles.rowText, { color: "#EF4444", marginLeft: 10 }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  scrollContainer: { paddingBottom: 100 },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  profileSection: {
    marginTop: 20,
    alignItems: "center", 
    paddingHorizontal: 20 
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#10B981",
  },
  profileName: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  profileHandle: { fontSize: 16, color: "#059669", marginBottom: 16 },
  editButton: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  editButtonText: { color: "#059669", fontWeight: "600" },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  statBox: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    width: "30%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#064E3B" },
  statLabel: { fontSize: 14, color: "#6B7280" },
  menuSection: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  rowText: { fontSize: 16, color: "#1F2937", marginLeft: 15 },
  placeholder: {
    backgroundColor: "#E5E7EB",
    opacity: 0.4,
  },
});
