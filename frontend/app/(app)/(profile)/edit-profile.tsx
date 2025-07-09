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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { updateProfile } from "@/lib/api";
import { router } from "expo-router";
import { useProfileStore } from "@/stores/useProfileStore";
import * as ImagePicker from "expo-image-picker";
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
      mediaTypes: ["images"],
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

      if (avatar) {
        // If an avatar is selected (not old one)
        formData.append("avatar", {
          uri: avatar.uri,
          name: `avatar.jpg`,
          type: avatar.mimeType || "image/jpeg",
        } as any);
      }
      const updatedProfile = await updateProfile(formData);
      // Remove old avatar
      if (
        updatedProfile.avatar_path &&
        updatedProfile.avatar_path !== profile?.avatar_path
      ) {
        await AsyncStorage.removeItem(`avatar-${profile?.avatar_path}`);
      }
      //setProfile(updatedProfile);
      Alert.alert("Success", "Your profile has been updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Update failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#064E3B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <Image
              source={{
                uri:
                  avatar?.uri ||
                  avatarUrl ||
                  "https://placehold.co/200x200/ECFDF5/064E3B?text=User",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity onPress={handlePickImage}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#059669"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              style={styles.input}
              placeholder="Your username"
              autoCapitalize="none"
              placeholderTextColor="#059669"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4", // Consistent app background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#D1FAE5",
  },
  backButton: {
    position: "absolute", left: 20 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#064E3B",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#10B981", // Primary green border
    backgroundColor: "#ECFDF5",
  },
  changeAvatarText: {
    color: "#10B981",
    fontWeight: "600",
    marginTop: 10,
    fontSize: 16,
  },
  formSection: {},
  label: {
    fontSize: 16,
    color: "#059669", // Secondary green
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: "#D1FAE5",
    borderWidth: 1,
    marginBottom: 20,
    color: "#064E3B",
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  saveButton: {
    backgroundColor: "#10B981", // Primary green button
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
