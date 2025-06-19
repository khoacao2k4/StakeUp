import { View, StyleSheet } from "react-native";

export const BetCardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={styles.placeholderAvatar} />
        <View style={[styles.placeholder, { width: 120, height: 14 }]} />
      </View>
      <View
        style={[styles.placeholder, { width: "90%", height: 22, marginTop: 8 }]}
      />
      <View
        style={[styles.placeholder, { width: "60%", height: 16, marginTop: 6 }]}
      />
      <View style={styles.cardFooter}>
        <View style={[styles.placeholder, { width: "40%", height: 16 }]} />
        <View style={[styles.placeholder, { width: "30%", height: 16 }]} />
      </View>
    </View>
    <View style={styles.cardImageContainer}>
      <View style={styles.placeholderImage} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cardImageContainer: {
    width: 100,
  },
  // --- Skeleton Styles ---
  placeholder: { 
    backgroundColor: "#E5E7EB", 
    borderRadius: 6 
  },
  placeholderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
});