import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { createBet } from "@/lib/api";
import BetForm from "@/components/BetForm"; // Import the reusable form

export default function CreateScreen() {
  // All form state is managed by the parent screen
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [options, setOptions] = useState([{ text: "" }, { text: "" }]);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const clearAllFields = () => {
    setTitle("");
    setDescription("");
    setEndDate(undefined);
    setOptions([{ text: "" }, { text: "" }]);
  };

  const handleCreateBet = async () => {
    const validOptions = options
      .map((option) => ({ text: option.text.trim() }))
      .filter((option) => option.text !== "");

    if (!title || validOptions.length < 2 || !endDate) {
      Alert.alert(
        "Missing Information",
        "A bet must have a title, an end date, and at least two valid options."
      );
      return;
    }

    if (new Set(validOptions.map((option) => option.text)).size !== validOptions.length) {
      Alert.alert("Duplicate Option", "Please enter unique options.");
      return;
    }

    setLoading(true);
    try {
      await createBet({
        title,
        description,
        options: validOptions,
        closed_at: endDate,
      });

      clearAllFields();

      Alert.alert(
        "Success",
        `Bet "${title}" created successfully! Have fun! 💵`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(app)/(tabs)/home"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Bet</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <BetForm
          title={title}
          onTitleChange={setTitle}
          description={description}
          onDescriptionChange={setDescription}
          endDate={endDate}
          onEndDateChange={setEndDate}
        >
          {/* The editable options section is passed as children */}
          <View style={styles.optionsSection}>
            <Text style={styles.label}>Options</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionInputContainer}>
                <TextInput
                  value={option.text}
                  onChangeText={(text) => handleOptionChange(text, index)}
                  style={styles.optionInput}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor="#9CA3AF"
                />
                {options.length > 2 && (
                  <TouchableOpacity
                    onPress={() => removeOption(index)}
                    style={styles.removeButton}
                  >
                    <Feather name="x" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addOption} style={styles.addButton}>
              <Feather name="plus" size={20} color="#059669" />
              <Text style={styles.addButtonText}>Add Option</Text>
            </TouchableOpacity>
          </View>
        </BetForm>

        {/* The final submit button is rendered here */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleCreateBet}
            style={styles.createButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Post Bet</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// Styles specific to the CreateScreen layout
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#064E3B"
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 120 },
  optionsSection: { 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB'
  },
  label: {
    fontSize: 16,
    color: "#059669",
    marginBottom: 8,
    fontWeight: "600",
  },
  optionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: "#D1FAE5",
    borderWidth: 1,
    color: "#064E3B",
  },
  removeButton: { padding: 10, marginLeft: 8 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
    marginTop: 8,
  },
  addButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  createButton: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
