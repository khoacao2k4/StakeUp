import { useEffect, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase"; // Adjust path if needed
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider"; // Import the new slider
import BetDetailSkeleton from "@/components/BetDetailSkeleton";
import { Profile } from "@/app/(app)/(tabs)/profile";

interface Bet {
  id: string;
  title: string;
  options: { text: string; odds: number }[];
  close_date: string;
  profiles: Profile | null;
  participant_count: number;
}

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [wagerAmount, setWagerAmount] = useState(50);
  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [userCoinBalance, setUserCoinBalance] = useState(1000); // Mock user balance

  const [sheetAnimation] = useState(
    new Animated.Value(Dimensions.get("window").height)
  );

  useEffect(() => {
    const fetchBetDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bets")
        .select("*, profiles(*)")
        .eq("id", id)
        .single();
      if (error) {
        Alert.alert("Error", "Could not load bet details.");
        setLoading(false);
        return;
      }
      data.options = data.options.map((opt: { text: string }) => ({
        ...opt,
        odds: Math.random() * 2 + 1.5,
      }));
      data.close_date = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      data.participant_count = Math.floor(Math.random() * 100);
      if (data.profiles?.avatar_path) {
        const { data: signedUrlData } = await supabase.storage
          .from("avatars")
          .createSignedUrl(data.profiles.avatar_path, 3600);
        setCreatorAvatar(signedUrlData?.signedUrl || null);
      }
      setBet(data as Bet);
      setLoading(false);
    };
    fetchBetDetails();
  }, [id]);

  useEffect(() => {
    if (!bet?.close_date) return;
    const timer = setInterval(() => {
      const difference =
        new Date(bet.close_date).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft("CLOSED");
        clearInterval(timer);
        return;
      }
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [bet?.close_date]);

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    Animated.spring(sheetAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  const handleCloseSheet = () => {
    Animated.timing(sheetAnimation, {
      toValue: Dimensions.get("window").height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedOption(null);
      setWagerAmount(50);
    });
  };
  const handlePlaceBet = () => {
    Alert.alert("Success", "Bet placed!", [
      { text: "OK", onPress: handleCloseSheet },
    ]);
  };

  if (loading) return <BetDetailSkeleton />;
  if (!bet)
    return (
      <View style={styles.container}>
        <Text>Bet not found.</Text>
      </View>
    );

  const betImage = `https://placehold.co/600x400/ECFDF5/064E3B?text=${
    bet.title.split(" ")[0]
  }`;
  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handleCloseSheet}>
        <View style={styles.container}>
          <View style={styles.imageHeader}>
            <Image source={{ uri: betImage }} style={styles.headerImage} />
            <LinearGradient
              colors={["rgba(0, 0, 0, 0)", "transparent", "rgba(0,0,0,0.4)"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonAbsolute}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.creatorInfo}>
            <Image
              source={{
                uri:
                  creatorAvatar ||
                  "https://placehold.co/100x100/A7F3D0/064E3B?text=?",
              }}
              style={styles.avatar}
            />
            <Text style={styles.creatorName}>
              @{bet.profiles?.username || "anonymous"}
            </Text>
          </View>
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <Text style={styles.title}>{bet.title}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Feather name="users" size={16} color="#059669" />
                <Text style={styles.statText}>
                  {bet.participant_count} Bettors
                </Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="clock" size={16} color="#059669" />
                <Text style={styles.statText}>{timeLeft}</Text>
              </View>
            </View>
            <Text style={styles.optionsTitle}>Choose an Option</Text>
            <View style={styles.optionsGrid}>
              {bet.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === index && styles.optionSelected,
                  ]}
                  onPress={() => handleSelectOption(index)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === index && styles.optionTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                  <Text
                    style={[
                      styles.oddsText,
                      selectedOption === index && styles.optionTextSelected,
                    ]}
                  >
                    Odds: {option.odds.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      {selectedOption !== null && (
        <Animated.View
          style={[
            styles.wagerSheet,
            { transform: [{ translateY: sheetAnimation }] },
          ]}
        >
          <Text style={styles.wagerSheetTitle}>Place Your Wager</Text>
          <View style={styles.wagerDisplay}>
            <Text style={styles.wagerAmountText}>{wagerAmount}</Text>
            <Text style={styles.coinText}>COINS</Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={userCoinBalance}
            value={wagerAmount}
            onValueChange={(value) => setWagerAmount(Math.round(value))}
            step={1}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#10B981"
          />
          <View style={styles.wagerBounds}>
            <Text style={styles.boundText}>1</Text>
            <Text style={styles.boundText}>{userCoinBalance}</Text>
          </View>
          <Text style={styles.potentialWinText}>
            Potential Win:{" "}
            {(wagerAmount * bet.options[selectedOption].odds).toFixed(0)} Coins
          </Text>
          <TouchableOpacity
            style={styles.placeBetButton}
            onPress={handlePlaceBet}
          >
            <Text style={styles.placeBetButtonText}>Confirm Bet</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCloseSheet}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  imageHeader: { height: 200, width: "100%" },
  headerImage: { width: "100%", height: "100%" },
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
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  creatorName: { fontSize: 16, fontWeight: "bold", color: "#064E3B" },
  content: { flex: 1, paddingTop: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#ECFDF5",
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 14, fontWeight: "600", color: "#047857" },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    width: "48%",
    minHeight: 80,
    justifyContent: "center",
  },
  optionSelected: { backgroundColor: "#10B981", borderColor: "#047857" },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  oddsText: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  optionTextSelected: { color: "#FFFFFF" },
  wagerSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  wagerSheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 24,
  },
  wagerDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 10,
  },
  wagerAmountText: { fontSize: 48, fontWeight: "bold", color: "#10B981" },
  coinText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  wagerBounds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  boundText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  potentialWinText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  placeBetButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  placeBetButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  cancelText: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 16,
  },
  placeholder: { backgroundColor: "#E5E7EB", borderRadius: 12 },
});
