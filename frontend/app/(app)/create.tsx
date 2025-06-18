import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { createBet } from "@/lib/api";
import { router } from "expo-router";

export interface BetInfo {
  title: string;
  description: string;
  options: { text: string }[];
}

export default function CreateScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
    setOptions([{ text: "" }, { text: "" }]);
  };

  const handleCreateBet = async () => {
    Keyboard.dismiss();
    // Validate the form
    const validOptions = options
      .map((option) => ({ text: option.text.trim() }))
      .filter((option) => option.text !== "");

    if (!title.trim() || validOptions.length < 2) {
      Alert.alert(
        "Missing Information",
        "A bet must have a title and at least two valid options."
      );
      return;
    }
    //call api
    setLoading(true);
    try {
      const betInfo: BetInfo = {
        title,
        description,
        options: validOptions,
      };
      await createBet(betInfo);
      Alert.alert(
        "Success",
        `Bet ${title} created successfully! Have fun! 💵`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(app)/home");
              clearAllFields();
            },
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create a New Bet</Text>
        </View>
        {/* form */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Text style={styles.label}>Bet Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="e.g., Who wins the next match?"
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.multilineInput]}
              placeholder="Add any extra details or rules here."
              multiline
            />

            <Text style={styles.label}>Options</Text>
            {options.map((option, index) => (
              <View key={index} style={styles.optionInputContainer}>
                <TextInput
                  value={option.text}
                  onChangeText={(text) => handleOptionChange(text, index)}
                  style={styles.optionInput}
                  placeholder={`Option ${index + 1}`}
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  scrollContainer: {
    flexGrow: 1,
    // This padding ensures that the content at the end of the scroll
    // has space and is not hidden by the tab bar.
    paddingBottom: 120,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#059669",
    marginBottom: 8,
    fontWeight: "600",
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
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
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
  removeButton: {
    padding: 10,
    marginLeft: 8,
  },
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
    marginBottom: 20,
  },
  addButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Replaced 'footer' view with this container for the button
  buttonContainer: {
    marginTop: 40,
  },
  createButton: {
    backgroundColor: "#10B981",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
