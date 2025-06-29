import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  // FIX: Import KeyboardAvoidingView and Platform
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getBetDetails, updateBet, cancelBet } from "@/lib/api";
import { Bet } from "@/app/(app)/(tabs)/home";
import BetDetailSkeleton from "@/components/BetDetailSkeleton";
import BetForm from "@/components/BetForm"; // Import the reusable form

export default function EditBetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // State for the form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [betOptions, setBetOptions] = useState<{ text: string }[]>([]);

  // Loading and submitting states
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch bet details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBetDetails(id)
      .then((data) => {
        // Populate the state with fetched data
        setTitle(data.title);
        setDescription(data.description || "");
        setBetOptions(data.options || []);
        if (data.closed_at) {
          setEndDate(new Date(data.closed_at));
        }
      })
      .catch((err) => {
        Alert.alert("Error", "Could not load bet details.");
        router.back();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateBet = async () => {
    //only check bet title
    if (!title) {
      Alert.alert("Invalid Input", "The bet must have a title.");
      return;
    }
    setIsUpdating(true);
    try {
      await updateBet(id, {
        title: title.trim(),
        description: description.trim(),
        closed_at: endDate,
      });
      Alert.alert("Success", "Bet has been updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not update the bet.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelBet = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await cancelBet(id);
      Alert.alert("Bet Cancelled", "This bet is no longer active.", [
        { text: "OK", onPress: () => router.replace("/(app)/(tabs)/home") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not cancel the bet.");
    } finally {
      setIsCancelling(false);
    }
  };

  const confirmCancel = () => {
    Alert.alert(
      "Cancel Bet",
      "Are you sure? This will prevent any further wagers.",
      [
        { text: "Nevermind", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: handleCancelBet },
      ]
    );
  };

  if (loading) {
    return <BetDetailSkeleton />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#064E3B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Bet</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BetForm
            title={title}
            onTitleChange={setTitle}
            description={description}
            onDescriptionChange={setDescription}
            endDate={endDate}
            onEndDateChange={setEndDate}
          >
            {/* Read-only options section */}
            <View style={styles.optionsSection}>
              <Text style={styles.label}>Options (Cannot be edited)</Text>
              {betOptions.map((option, index) => (
                <View key={index} style={styles.optionDisabled}>
                  <Text style={styles.optionDisabledText}>{option.text}</Text>
                </View>
              ))}
            </View>
          </BetForm>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleUpdateBet}
              style={styles.updateButton}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.updateButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmCancel}
              style={styles.cancelButton}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.cancelButtonText}>Cancel Bet</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F0FDF4" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: { position: "absolute", left: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  scrollContainer: { flexGrow: 1, paddingBottom: 120 },
  optionsSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: "#059669",
    marginBottom: 8,
    fontWeight: "600",
  },
  optionDisabled: {
    backgroundColor: "#F3F4F6",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    marginBottom: 12,
  },
  optionDisabledText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  updateButton: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f91630",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
