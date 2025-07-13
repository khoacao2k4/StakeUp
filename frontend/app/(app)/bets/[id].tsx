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
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase"; // Adjust path if needed
import { Image } from "expo-image";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import BetDetailSkeleton from "@/components/BetDetailSkeleton";
import { Bet } from "@/app/(app)/(tabs)/home";
import { getBetDetails, getBetPlacement, placeBet } from "@/lib/api";
import timeLeftInfo from "@/utils/calculateTimeLeft";
import { useProfileStore } from "@/stores/useProfileStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import SettlementModal from "@/components/SettlementModal";

interface BetStatsPayload {
  participant_count: number;
  odds: number[];
}

interface BetPlacement {
  option_idx: number;
  amount: number;
  payout: number | null;
}

type WagerStatus = "idle" | "submitting" | "success";

export default function BetDetailScreen() {
  // BET DETAIL
  const { id } = useLocalSearchParams<{ id: string }>(); //bet id from url
  const [bet, setBet] = useState<Bet | null>(null); // bet details
  const [loading, setLoading] = useState(true); // loading state
  const [timeLeft, setTimeLeft] = useState(""); // time left to close the bet
  // USER DETAIL
  const { profile, setProfile } = useProfileStore();
  const [userPlacement, setUserPlacement] = useState<BetPlacement | null>(null);
  const hasEmptyBalance = profile?.coin_balance === 0;
  const isHost = profile?.id === bet?.profiles?.id;
  // BET LOGIC
  const isBetClosed = timeLeft === "CLOSED";
  const hasUserBet = userPlacement !== null;

  // BET PLACEMENT
  const [selectedOption, setSelectedOption] = useState<number | null>(null); //options selected
  const DEFAULT_WAGER_AMOUNT = Math.floor((profile?.coin_balance ?? 2) / 2);
  const [wagerAmount, setWagerAmount] = useState(DEFAULT_WAGER_AMOUNT);
  const [wagerStatus, setWagerStatus] = useState<WagerStatus>("idle");

  // BET SETTLEMENT
  const [isSettleModalVisible, setIsSettleModalVisible] = useState(false);
  const isSettled = bet?.status === 'settled';
  const isCancelled = bet?.status === 'cancelled';
  const canSettle = isHost && isBetClosed && bet?.status === "open";
  const isLocked = isBetClosed || hasUserBet || isSettled || hasEmptyBalance || isCancelled;
  const didUserWin = hasUserBet && userPlacement.option_idx === bet?.settled_option;

  const [sheetAnimation] = useState(
    new Animated.Value(Dimensions.get("window").height)
  );

  const getOptionIcon = (isWinningOption: boolean, isSelected: boolean) => {
    if (isSettled && isWinningOption) 
      return <Feather name="check-circle" size={16} color="#fff" style={styles.optionIcon} />
    if (isSettled && !isWinningOption && isSelected)
      return <Feather name="x-circle" size={18} color="#fff" style={styles.optionIcon} />
    return null;
  };

  // ================================================= FUNCTIONS =================================================
  // Handles initial data fetching and all realtime subscriptions
  useEffect(() => {
    // If there's no ID or profile, don't do anything.
    if (!id || !profile?.id) return;

    let betChannel: RealtimeChannel | null = null;
    let statsChannel: RealtimeChannel | null = null;

    const fetchBetStats = async () => {
      const { data, error } = await supabase.rpc("get_bet_stats", { p_bet_id: id });
      if (error) {
        console.error("Error fetching bet stats:", error);
      } else if (data) {
        const stats: BetStatsPayload = data;
        setBet((currentBet) => {
          if (!currentBet || !currentBet.options) return currentBet;
          return {
            ...currentBet,
            participant_count: stats.participant_count,
            odds: stats.odds,
          };
        });
      }
    };

    const setupPage = async () => {
      setLoading(true);
      try {
        // Fetch bet details
        await Promise.all([getBetDetails(id), getBetPlacement(id)]).then(
          async ([betDetails, placement]) => {
            setBet(betDetails);
            setUserPlacement(placement);
            if (betDetails.status !== "cancelled") {
              calculateAndSetTimeLeft(betDetails.closed_at);
              await fetchBetStats();
            }
            // Subscribe to realtime updates for the bet from host
            if (betDetails?.status === "open") {
              console.log("Subscribing to realtime updates...");
              betChannel = supabase
                .channel(`bet_changes_${id}`)
                .on<Bet>(
                  "postgres_changes",
                  {
                    event: "UPDATE",
                    schema: "public",
                    table: "bets",
                    filter: `id=eq.${id}`,
                  },
                  (payload) => {
                    console.log("Bet updated from database:", payload.new);
                    setBet((current) => ({ ...current, ...payload.new }));
                    if (payload.new.closed_at) {
                      calculateAndSetTimeLeft(payload.new.closed_at);
                    }
                  }
                )
                .subscribe();
              // Subscribe to updates from bet stats (1-min interval)
              statsChannel = supabase
                .channel(`stats_changes_${id}`)
                .on("broadcast", { event: "stats_updated" }, () => {
                  fetchBetStats();
                })
                .subscribe();
            }
          }
        );
        //console.log("Page setup complete.");
      } catch (error) {
        console.error("Error setting up page:", error);
        Alert.alert("Error", "Could not load bet details.");
      } finally {
        //console.log(supabase.getChannels());
        setLoading(false);
      }
    };
    setupPage();
    return () => {
      if (betChannel) betChannel.unsubscribe();
      if (statsChannel) statsChannel.unsubscribe();
      console.log("Cleanup complete.");
    };
  }, []);

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

  useEffect(() => {
    // Don't start the timer if there's no bet or close date
    if (!bet?.closed_at || bet.status === "cancelled") return;

    const timer = setInterval(() => {
      // The function will calculate the time and tell us if it should stop
      const shouldContinue = calculateAndSetTimeLeft(bet.closed_at);
      if (!shouldContinue) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [bet?.closed_at]);

  const handleSelectOption = (index: number) => {
    if (hasEmptyBalance || isLocked) return;
    setWagerAmount(DEFAULT_WAGER_AMOUNT); // Reset wager amount each time
    setSelectedOption(index);
    Animated.spring(sheetAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseSheet = () => {
    Animated.timing(sheetAnimation, {
      toValue: Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedOption(null);
      setWagerStatus("idle"); // Reset status when sheet closes
    });
  };

  const handlePlaceBet = async () => {
    if (hasEmptyBalance || selectedOption === null) return;
    setWagerStatus("submitting"); // Set status to submitting
    try {
      await placeBet(id, selectedOption, wagerAmount);
      // On success, update the UI to the success state
      setWagerStatus("success");
      setUserPlacement({ option_idx: selectedOption, amount: wagerAmount, payout: null });
      // After x seconds, automatically close the sheet
      setTimeout(() => {
        handleCloseSheet();
      }, 3000);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not place the bet.");
      setWagerStatus("idle"); // Reset status on error
    }
  };

  // ================================================ UI/UX ================================================

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
          {/* Header Image */}
          <View style={styles.imageHeader}>
            <Image
              source={{ uri: `https://picsum.photos/seed/${bet.id}/600/400` }}
              style={styles.headerImage}
            />
            <LinearGradient
              colors={["rgba(0, 0, 0, 0)", "transparent", "rgba(0,0,0,0.4)"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          {/* Creator Info*/}
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
          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            {/* Title and Description */}
            <Text style={styles.title}>{bet.title}</Text>
            {bet.description && (
              <Text style={styles.description}>{bet.description}</Text>
            )}

            {/* Stats Container*/}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Feather name="users" size={16} color="#059669" />
                <Text style={styles.statText}>
                  {bet.participant_count} Bettors
                </Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="clock" size={16} color="#059669" />
                <Text style={styles.statText}>{isCancelled ? 'CANCELLED' : timeLeft}</Text>
              </View>
            </View>

            {/* Settle Button for Host */}
            {canSettle && (
              <TouchableOpacity style={styles.settleButton} onPress={() => setIsSettleModalVisible(true)}>
                <FontAwesome name="gavel" size={24} color="#0bd697" />
                <Text style={styles.settleButtonText}>Settle This Bet</Text>
              </TouchableOpacity>
            )}

            {/* Conditional title based on coin balance */}
            <Text style={styles.optionsTitle}>
              {isCancelled ? "Bet Cancelled" :
              isSettled ? "Final Result" : 
              isBetClosed ? "Betting has closed" : 
              hasUserBet ? "Your chosen option" : 
              hasEmptyBalance ? "You have no coins 😔" :
              "Choose an Option"}
            </Text>

            {isCancelled && (
              <View style={[styles.resultBanner, styles.resultBannerCancelled]}>
                <Feather name="slash" size={20} color="#fff" />
                <Text style={styles.resultBannerText}>This bet was cancelled by the host.</Text>
              </View>
            )}

            {isSettled && hasUserBet && (
              <View style={[styles.resultBanner, didUserWin ? styles.resultBannerWin : styles.resultBannerLoss]}>
                <Feather name={didUserWin ? "award" : "x-octagon"} size={20} color="#fff" />
                <Text style={styles.resultBannerText}>
                  {didUserWin ? `You Won! 🎉🎉 Payout: ${userPlacement.payout || 0} Coins` : "You Lost 😭"}
                </Text>
              </View>
            )}
            
            <View style={styles.optionsGrid}>
              {bet.options?.map((option, index) => {
                const isSelected = userPlacement?.option_idx === index || selectedOption === index;
                const isWinningOption = bet.settled_option === index;
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.optionButton,
                      isLocked && styles.optionLocked,
                      !isSettled && isSelected && styles.optionSelected,
                      isSettled && isWinningOption && styles.optionWinner,
                      isSettled && !isWinningOption && isSelected && styles.optionLoser,
                      pressed ? !isLocked && { opacity: 0.5 } : null,
                    ]}
                    onPress={() => {
                      if (isLocked) return;
                      handleSelectOption(index);
                    }}
                  >
                    {getOptionIcon(isWinningOption, isSelected)}
                    <Text style={[styles.optionText, (isSelected || (isSettled && isWinningOption)) && styles.optionTextSelected]}>{option.text}</Text>
                    <Text style={[styles.oddsText, (isSelected || (isSettled && isWinningOption)) && styles.optionTextSelected]}>Odds: {bet.odds ? bet.odds[index].toFixed(2) : "1.00"}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* --- OVERLAYS --- */}
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.navigateButton, { left: 20 }]}
      >
        <Feather name="arrow-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      {/* Edit Bet Button (HOST ONLY) */}
      {isHost && bet.status === "open" && (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/bets/edit/[id]",
              params: { id: id },
            })
          }
          style={[styles.navigateButton, { right: 20 }]}
        >
          <Feather name="edit-2" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      {/* Wager Sheet Overlay */}
      {selectedOption !== null && bet.options && (
        <Animated.View style={[styles.wagerSheet, { transform: [{ translateY: sheetAnimation }] }]}>
          {/* Conditionally render UI based on wagerStatus */}
          {wagerStatus === "success" ? (
            <View style={styles.successView}>
              <Animated.View>
                <Feather name="check-circle" size={80} color="#10B981" />
              </Animated.View>
              <Text style={styles.successTitle}>Bet Placed!</Text>
              <Text style={styles.successSubtitle}>
                You wagered {wagerAmount} coins on "{bet.options[selectedOption].text}". Good luck!
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.wagerSheetTitle}>Place Your Wager</Text>

              <View style={styles.selectedOptionContainer}>
                <Text style={styles.selectedOptionLabel}>Your choice:</Text>
                <Text style={styles.selectedOptionText}>
                  {bet.options[selectedOption].text}
                </Text>
              </View>

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
                Potential Win: {(wagerAmount * (bet.odds?.[selectedOption] || 0)).toFixed(0)} Coins
              </Text>
              <TouchableOpacity
                style={styles.placeBetButton}
                onPress={handlePlaceBet}
                disabled={wagerStatus === 'submitting'}
              >
                {wagerStatus === 'submitting' ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.placeBetButtonText}>Confirm Bet</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCloseSheet}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}
      <SettlementModal
        isVisible={isSettleModalVisible}
        onClose={() => setIsSettleModalVisible(false)}
        bet={bet}
        userPlacementIdx={userPlacement?.option_idx ?? null}
      />
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
  content: { flex: 1, paddingTop: 20, paddingHorizontal: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8, // Reduced margin
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#ECFDF5",
    paddingVertical: 12,
    borderRadius: 16,
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
  },
  warningText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
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
  optionSelected: { backgroundColor: "#10B981", borderColor: "#047857", opacity: 1 },
  optionDisabled: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB",  opacity: 0.6 },
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
    minHeight: 450, 
    justifyContent: 'center'
  },
  wagerSheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8, // Reduced margin
  },
  selectedOptionContainer: {
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  selectedOptionLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedOptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
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
    minHeight: 58, // Set a min-height to prevent layout jump when showing indicator
    justifyContent: 'center'
  },
  placeBetButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  cancelText: {
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 16,
  },
  successView: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#064E3B',
    marginTop: 20,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  settleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#065F46',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  settleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 16 },
  resultBannerWin: { backgroundColor: '#10B981' },
  resultBannerLoss: { backgroundColor: '#EF4444' },
  resultBannerCancelled: { backgroundColor: '#6B7280' },
  resultBannerText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  optionLocked: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB", opacity: 0.6 },
  optionWinner: { backgroundColor: '#FBBF24', borderColor: '#B45309', opacity: 1 },
  optionLoser: { backgroundColor: '#EF4444', borderColor: '#B91C1C', opacity: 1 },
  optionIcon: { position: 'absolute', top: 8, right: 8 },
});
