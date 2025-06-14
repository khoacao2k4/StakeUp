import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create a New Bet</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          The bet creation form will be here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#059669", fontSize: 16 },
});
