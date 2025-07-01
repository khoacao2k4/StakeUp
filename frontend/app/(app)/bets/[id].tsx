import { useCallback, useEffect, useState } from "react";
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
import { Bet } from "@/app/(app)/(tabs)/home";
import { getBetDetails } from "@/lib/api";
import timeLeftInfo from "@/utils/calculateTimeLeft";
import { useProfileStore } from "@/stores/useProfileStore";
import { RealtimeChannel } from "@supabase/supabase-js";

interface BetStatsPayload {
  participant_count: number;
  odds: number[];
}

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); //bet id from url
  const [bet, setBet] = useState<Bet | null>(null); // bet details
  const [loading, setLoading] = useState(true); // loading state
  const [timeLeft, setTimeLeft] = useState("");

  const { profile } = useProfileStore();
  const hasEmptyBalance = profile?.coin_balance === 0;
  const isHost = profile?.id === bet?.profiles?.id;

  const [selectedOption, setSelectedOption] = useState<number | null>(null); //options selected
  const [wagerAmount, setWagerAmount] = useState(50);

  const [sheetAnimation] = useState(
    new Animated.Value(Dimensions.get("window").height)
  );

  const calculateAndSetTimeLeft = useCallback((closeDate: string | undefined) => {
    if (!closeDate) {
      setTimeLeft("No end date");
      return false; // Return false to signal the timer should stop
    }
    const difference = timeLeftInfo(new Date(closeDate).getTime());
    if (difference.end) {
      setTimeLeft("CLOSED");
      return false; // Return false to signal the timer should stop
    }
    const { days, hours, minutes, seconds } = difference;
    setTimeLeft(
      `${days ? `${days}d ` : ""}${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );
    return true; // Return true to signal the timer should continue
  }, []);

  // Handles initial data fetching and all realtime subscriptions
  useEffect(() => {
    if (!id) return;

    let betChannel: RealtimeChannel | null = null;
    let statsChannel: RealtimeChannel | null = null;

    const fetchBetStats = async () => {
      console.log(`Fetching latest bet stats for bet_id: ${id}...`);
      console.log(id);
      // const { data, error } = await supabase.rpc("get_bet_stats", { p_bet_id: id });
      const betId = '8fac54cc-b40b-49a4-aa4e-c28e3e4fdc82';
      const test = await supabase
        .from('bet_placements')
        .select('*')
        .eq('bet_id', betId);

      console.log(test.data); // should NOT be empty

      const { data, error } = await supabase.rpc('get_bet_stats', {
        p_bet_id: betId,
      });

      console.log("Hi", data);
      if (error) {
        console.error("Error fetching bet stats:", error);
      } else if (data) {
        const stats: BetStatsPayload = data;
        setBet((currentBet) => {
          if (!currentBet || !currentBet.options) return currentBet;
          
          // Merge the new odds into the existing options
          const updatedOptions = currentBet.options.map((option, index) => ({
            ...option,
            odds: stats.odds[index] || 1, // Use the odd from the new array
          }));

          return {
            ...currentBet,
            participant_count: stats.participant_count,
            options: updatedOptions,
          };
        });
      }
    };

    const setupPage = async () => {
      setLoading(true);
      try {
        // 1. Initial fetch for static details and dynamic stats
        const betDetails = await getBetDetails(id);
        setBet(betDetails);
        calculateAndSetTimeLeft(betDetails.closed_at);
        await fetchBetStats();

        // 2. Subscribe to INSTANT updates for static bet data (title, desc, date)
        betChannel = supabase
          .channel(`bet_changes_${id}`)
          .on<Bet>(
            "postgres_changes",
            { 
              event: "UPDATE", 
              schema: "public", 
              table: "bets", 
              filter: `id=eq.${id}` // Filter by bet ID
            },
            (payload) => {
              console.log("Bet details updated:", payload.new);
              setBet((current) => ({ ...current, ...payload.new }));
              if (payload.new.closed_at) {
                calculateAndSetTimeLeft(payload.new.closed_at);
              }
            }
          )
          .subscribe();
        
        statsChannel = supabase
          .channel(`stats_changes_${id}`)
          .on('broadcast', { event: 'stats_updated' }, () => {
            console.log("Received 'stats_updated' broadcast, refetching stats.");
            fetchBetStats();
          })
          .subscribe();

      } catch (error) {
        console.error("Error setting up page:", error);
        Alert.alert("Error", "Could not load bet details.");
      } finally {
        setLoading(false);
      }
    };

    setupPage();

    // Cleanup both subscriptions when the component unmounts
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    // Don't start the timer if there's no bet or close date
    if (!bet?.closed_at) return;

    const timer = setInterval(() => {
      // The function will calculate the time and tell us if it should stop
      const shouldContinue = calculateAndSetTimeLeft(bet.closed_at);
      if (!shouldContinue) {
        clearInterval(timer);
      }
    }, 500);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [bet?.closed_at]);

  const handleSelectOption = (index: number) => {
    if (hasEmptyBalance) return;
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

  return (
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handleCloseSheet}>
        <View style={styles.container}>
          <View style={styles.imageHeader}>
            <Image
              source={{
                // uri: `https://placehold.co/600x400/ECFDF5/064E3B?text=${
                //   bet.title.split(" ")[0]
                // }`,
                uri: `https://picsum.photos/seed/${bet.id}/600/400`
              }}
              style={styles.headerImage}
            />
            <LinearGradient
              colors={["rgba(0, 0, 0, 0)", "transparent", "rgba(0,0,0,0.4)"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.navigateButton, { left: 20}]}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Setting button (HOST only) */}
          {isHost && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(app)/bets/edit/[id]",
                  params: { id: id },
                })
              }
              style={[styles.navigateButton, { right: 20}]}
            >
              <Feather name="edit-2" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}


          <View style={styles.creatorInfo}>
            <Image
              source={{
                uri:
                  bet.profiles?.avatar_url ||
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
            {/* Conditional title based on coin balance */}
            {hasEmptyBalance ? (
              <Text style={styles.warningText}>
                You have no coins to place a bet!
              </Text>
            ) : (
              <Text style={styles.optionsTitle}>Choose an Option</Text>
            )}
            <View style={styles.optionsGrid}>
              {bet.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === index && styles.optionSelected,
                    hasEmptyBalance && styles.optionDisabled,
                  ]}
                  onPress={() => handleSelectOption(index)}
                  disabled={hasEmptyBalance} // Disable button if user has no coins
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
                    Odds: {option.odds?.toFixed(2) || 1}
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
            maximumValue={profile?.coin_balance}
            value={wagerAmount}
            onValueChange={(value) => setWagerAmount(Math.round(value))}
            step={1}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#10B981"
          />
          <View style={styles.wagerBounds}>
            <Text style={styles.boundText}>1</Text>
            <Text style={styles.boundText}>{profile?.coin_balance}</Text>
          </View>
          <Text style={styles.potentialWinText}>
            Potential Win:{" "}
            {/* {(wagerAmount * bet.options[selectedOption].odds).toFixed(0)*/}xx Coins
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
  navigateButton: {
    position: "absolute",
    top: 60,
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
  warningText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
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
  optionDisabled: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
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
