import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { updateProfile } from "@/lib/api";
import { useLocalSearchParams, router } from "expo-router";
import { Profile } from "@/app/(app)/profile";
import { useProfileStore } from "@/stores/useProfileStore";

export default function EditProfileScreen() {
  const { profile, setProfile } = useProfileStore();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [userName, setUserName] = useState(profile?.username || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedProfile = await updateProfile({ "full_name": fullName, "username": userName });
      setProfile(updatedProfile);
      router.back();
    } catch (err: any) {
      Alert.alert("Update failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoUploadWrapper}>
          <Feather name="camera" size={32} color="#6B7280" />
          <Text style={styles.photoUploadText}>Photo Upload +</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#10B981" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#111827",
  },
  content: {
    padding: 20,
  },
  photoUploadWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoUploadText: {
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    color: "#6B7280",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#D1FAE5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  saveText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#064E3B",
  },
});
