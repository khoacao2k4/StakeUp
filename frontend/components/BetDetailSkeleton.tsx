import { View, StyleSheet } from "react-native";

export default function BetDetailSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.imageHeader}>
        <View style={[styles.placeholder, { width: "100%", height: "100%" }]} />
      </View>
      <View style={styles.backButtonAbsolute}>
        <View
          style={[
            styles.placeholder,
            { width: 40, height: 40, borderRadius: 20 },
          ]}
        />
      </View>
      <View style={styles.creatorInfo}>
        <View
          style={[
            styles.placeholder,
            { width: 150, height: 48, borderRadius: 24 },
          ]}
        />
      </View>
      <View style={styles.content}>
        <View
          style={[
            styles.placeholder,
            {
              width: "80%",
              height: 30,
              borderRadius: 8,
              alignSelf: "center",
              marginBottom: 10,
            },
          ]}
        />
        <View
          style={[
            styles.placeholder,
            {
              width: "50%",
              height: 20,
              borderRadius: 8,
              alignSelf: "center",
              marginBottom: 20,
            },
          ]}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <View
            style={[
              styles.placeholder,
              { flex: 1, height: 40, borderRadius: 12 },
            ]}
          />
          <View
            style={[
              styles.placeholder,
              { flex: 1, height: 40, borderRadius: 12 },
            ]}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View
            style={[
              styles.placeholder,
              { flex: 1, height: 70, borderRadius: 16 },
            ]}
          />
          <View
            style={[
              styles.placeholder,
              { flex: 1, height: 70, borderRadius: 16 },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  imageHeader: { height: 200, width: "100%" },
  backButtonAbsolute: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  },
  creatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
    marginTop: -30,
  },
  content: { flex: 1, paddingTop: 20 },
  placeholder: { backgroundColor: "#E5E7EB", borderRadius: 12 },
});
