import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView } from "react-native-safe-area-context";
import { getToken, supabase } from "../../lib/supabase"; // Make sure this path is correct
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api";

interface Profile {
  username: string;
  website: string;
  avatar_url: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    getProfile()
      .then(data => setProfile(data))
      .catch(err => console.error('Failed to load profile', err));
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error signing out", error.message);
    }
    // The router should automatically redirect to the login page if the session is null.
  };

  const StatBox = ({ value, label, }: { value: string | number; label: string; }) => (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ProfileRow = ({
    icon,
    text,
    hasNav = false,
  }: {
    icon: any;
    text: string;
    hasNav?: boolean;
  }) => (
    <TouchableOpacity style={styles.row}>
      <Feather name={icon} size={20} color="#064E3B" />
      <Text style={styles.rowText}>{text}</Text>
      <View style={{ flex: 1 }} />
      {hasNav && <Feather name="chevron-right" size={20} color="#059669" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <Image source={profile?.avatar_url || "https://placehold.co/200x200/ECFDF5/064E3B?text=User"} style={styles.avatar} />
          <Text style={styles.name}>{profile?.username || 'Anonymous User'}</Text>
          <Text style={styles.handle}>@{profile?.username || 'anonymous'}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <StatBox value={12} label="Bets" />
          <StatBox value={24} label="Wins" />
          <StatBox value={36} label="Losses" />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <ProfileRow icon="dollar-sign" text="Coin Balance: 1,200" />
          <ProfileRow icon="award" text="Achievements" hasNav />
          <ProfileRow icon="settings" text="Settings" hasNav />
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.row, { justifyContent: "center" }]}
          >
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text
              style={[styles.rowText, { color: "#EF4444", marginLeft: 10 }]}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  scrollContainer: { paddingBottom: 30 },
  header: { padding: 20, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#064E3B" },
  profileSection: { alignItems: "center", paddingHorizontal: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#D1FAE5",
  },
  name: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  handle: { fontSize: 16, color: "#059669", marginBottom: 16 },
  editButton: {
    backgroundColor: "#ECFDF5",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
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
});
