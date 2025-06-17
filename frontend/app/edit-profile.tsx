import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { updateProfile } from "@/lib/api";
import { router } from "expo-router";
import { useProfileStore } from "@/stores/useProfileStore";
import * as ImagePicker from 'expo-image-picker';
import { Image } from "expo-image";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfileScreen() {
  const { profile, setProfile } = useProfileStore();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [userName, setUserName] = useState(profile?.username || "");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<any>(null);
  const avatarUrl = useAvatarUrl(profile);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("username", userName);

      if (avatar) { // If an avatar is selected (not old one)
        formData.append("avatar", {
          uri: avatar.uri,
          name: `avatar.jpg`,
          type: avatar.mimeType || "image/jpeg",
        } as any);
      }
      const updatedProfile = await updateProfile(formData);
      // Remove old avatar
      if (updatedProfile.avatar_path && updatedProfile.avatar_path !== profile?.avatar_path) {
        await AsyncStorage.removeItem(`avatar-${profile?.avatar_path}`);
      }
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
        <TouchableOpacity onPress={handlePickImage} style={styles.photoUploadWrapper}>
          {avatar?.uri || avatarUrl ? (
            <Image
              source={avatar?.uri || avatarUrl}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <Feather name="camera" size={32} color="#6B7280" />
          )}
          <Text style={styles.photoUploadText}>Photo Upload +</Text>
        </TouchableOpacity>

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
