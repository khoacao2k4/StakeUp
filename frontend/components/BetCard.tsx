import { Bet } from "@/app/(app)/(tabs)/home";
import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import timeLeftInfo from "@/utils/calculateTimeLeft";

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

export const BetCard = ({ bet }: { bet: Bet }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const writeTimeLeft = () => {
      if (!bet.closed_at) { // If no close date, won't show
        setTimeLeft("No end date");
        return;
      }
      const difference = timeLeftInfo(new Date(bet.closed_at).getTime());
      if (difference.end) {
        setTimeLeft("Closed");
        return;
      }
      const { days, hours, minutes } = difference;
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    writeTimeLeft();
    const timer = setInterval(writeTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [bet.closed_at]);

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.5} 
      onPress={() => {
        router.push({
          pathname: "/(app)/bets/[id]",
          params: { id: bet.id },
        });
      }}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri:
                bet.profiles?.avatar_url ||
                "https://placehold.co/100x100/A7F3D0/064E3B?text=?",
            }}
            style={styles.avatar}
          />
          <Text style={styles.creatorText}>
            @{bet.profiles?.username || "anonymous"}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {bet.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {bet.description}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.footerStat}>
            <Feather name="users" size={14} color="#059669" />
            <Text style={styles.footerText}>
              {bet.participant_count || "N/A"} bettors
            </Text>
          </View>
          <View style={styles.footerStat}>
            {timeLeft !== "Closed" && <Feather name="clock" size={14} color="#059669" />}
            <Text style={styles.footerText}>{timeLeft}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardImageContainer}>
        <Image
          source={{
            uri: `https://placehold.co/400x400/ECFDF5/10B981?text=${
              bet.title.split(" ")[0]
            }`,
          }}
          style={styles.cardImage}
          transition={300}
        />
      </View>
    </TouchableOpacity>
  );
};

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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  creatorText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    lineHeight: 20,
    minHeight: 40, // Ensure space for 2 lines
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
  footerStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  cardImageContainer: {
    width: 100,
  },
  cardImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#ECFDF5",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  // --- Skeleton Styles ---
  placeholder: { backgroundColor: "#E5E7EB", borderRadius: 6 },
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