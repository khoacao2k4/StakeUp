import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const formatEndDate = (date: Date | undefined) => {
  if (!date) return "Select a Date & Time";
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

interface BetFormProps {
  title: string;
  description: string;
  endDate: Date | undefined;

  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onEndDateChange: (date: Date) => void;

  // Hold the "Options" section
  children?: React.ReactNode;
}

export default function BetForm({
  title,
  description,
  endDate,
  onTitleChange,
  onDescriptionChange,
  onEndDateChange,
  children,
}: BetFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate || new Date());

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (selectedDate) {
      setTempEndDate(selectedDate);
    }
  };

  const handleConfirmDate = () => {
    if (tempEndDate < new Date()) {
      Alert.alert("Invalid Date: Please select a future date and time.");
      return;
    }
    // Pass the confirmed date up to the parent screen
    onEndDateChange(tempEndDate); 
    setShowDatePicker(false);
  };

  const handleOpenDatePicker = () => {
    // Initialize the picker with the current date or the existing one
    setTempEndDate(endDate || new Date());
    setShowDatePicker(true);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Bet Title</Text>
      <TextInput
        value={title}
        onChangeText={onTitleChange}
        style={styles.input}
        placeholder="e.g., Who wins the next match?"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        value={description}
        onChangeText={onDescriptionChange}
        style={[styles.input, styles.multilineInput]}
        placeholder="Add any extra details or rules here."
        placeholderTextColor="#9CA3AF"
        multiline
      />

      <Text style={styles.label}>End Date & Time</Text>
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

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={tempEndDate}
              mode="datetime"
              display="spinner"
              textColor="#059669"
              onChange={handleDateChange}
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

      {/* The "Options" UI will be rendered here */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { padding: 20 },
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
  datePickerPlaceholder: { color: "#9CA3AF" },
  datePickerContainer: { marginBottom: 20 },
  pickerWrapper: { height: 216, justifyContent: "center" },
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
  cancelButton: { backgroundColor: "#FEE2E2", marginRight: 10 },
  cancelButtonText: { color: "#DC2626", fontWeight: "bold" },
  confirmButton: { backgroundColor: "#D1FAE5" },
  confirmButtonText: { color: "#065F46", fontWeight: "bold" },
});

