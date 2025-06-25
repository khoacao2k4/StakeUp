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
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";

export interface BetInfo {
  title: string;
  description: string;
  options: { text: string }[];
  closed_at: Date;
}

const formatEndDate = (date: Date | undefined) => {
  if (!date) return "Select a Date & Time";
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

export default function CreateScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([{ text: "" }, { text: "" }]);
  const [loading, setLoading] = useState(false);

  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

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

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (selectedDate) {
      setTempEndDate(selectedDate);
    }
  };
  
  const handleOpenDatePicker = () => {
    // Set the temp date to the already selected date, or now if none is selected
    setTempEndDate(endDate || new Date());
    setShowDatePicker(true);
  }
  const handleConfirmDate = () => {
    if (tempEndDate < new Date()) {
      Alert.alert("Invalid Date", "Please select a future date and time.");
      return;
    }
    setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  const clearAllFields = () => {
    setTitle("");
    setDescription("");
    setOptions([{ text: "" }, { text: "" }]);
    setEndDate(undefined);
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

    if (!endDate) {
      Alert.alert(
        "Missing Information",
        "Please set an end date for the bet."
      );
      return;
    }
    setLoading(true);
    try {
      const betInfo: BetInfo = {
        title,
        description,
        options: validOptions,
        closed_at: endDate,
      };
      await createBet(betInfo);
      Alert.alert(
        "Success",
        `Bet ${title} created successfully! Have fun! 💵`,
        [{
            text: "OK",
            onPress: () => {
              router.replace("/(app)/(tabs)/home");
              clearAllFields();
            }
        }]
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
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.multilineInput]}
              placeholder="Add any extra details or rules here."
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <Text style={styles.label}>Bet End Date & Time</Text>
            
            {!showDatePicker && 
              <TouchableOpacity
                onPress={handleOpenDatePicker}
                style={styles.datePickerButton}
              >
                <Feather name="calendar" size={20} color="#059669" />
                <Text
                  style={[
                    styles.datePickerButtonText,
                    !endDate && styles.datePickerPlaceholder,
                  ]}
                >
                  {formatEndDate(endDate)}
                </Text>
              </TouchableOpacity>
            }

            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={tempEndDate}
                    mode="datetime"
                    display="spinner"
                    textColor="#059669"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                </View>
                <View style={styles.pickerButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={[styles.pickerButton, styles.cancelButton]}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmDate}
                    style={[styles.pickerButton, styles.confirmButton]}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderColor: "#D1FAE5",
    borderWidth: 1,
    marginBottom: 20,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#064E3B",
    marginLeft: 10,
  },
  datePickerPlaceholder: {
    color: "#9CA3AF",
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  pickerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  pickerButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#DC2626",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#D1FAE5",
  },
  confirmButtonText: {
    color: "#065F46",
    fontWeight: "bold",
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
  },
  addButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
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
  pickerWrapper: {
    height: 216,
    justifyContent: "center",
  },
});