import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Bet } from '@/app/(app)/(tabs)/home';
import { settleBet } from '@/lib/api';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface SettlementModalProps {
  bet: Bet;
  userPlacementIdx: number | null;
  isVisible: boolean;
  onClose: () => void;
  onBetSettled: (winningOptionIndex: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function SettlementModal({
  bet,
  userPlacementIdx,
  isVisible,
  onClose,
  onBetSettled,
}: SettlementModalProps) {
  const [settleSelection, setSettleSelection] = useState<number | null>(null); // Index of the option to settle
  const [isSettling, setIsSettling] = useState(false); // Loading state
  
  const translateY = useSharedValue(SCREEN_HEIGHT); // Y position of the sheet (0 = open, SCREEN_HEIGHT = closed)

  const closeSheet = useCallback(() => {
    // Animate the sheet down
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      // After the animation finishes, call the parent's onClose function
      runOnJS(onClose)();
    });
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      // Animate the sheet up with a smooth timing animation
      translateY.value = withTiming(0, { duration: 350 });
      setSettleSelection(null);
    }
  }, [isVisible]);

  const handleSettleBet = () => {
    if (settleSelection === null) return;
    Alert.alert(
      "Confirm Winner",
      `Are you sure you want to declare "${bet.options?.[settleSelection].text}" as the winner? This is final.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Pay Out",
          onPress: async () => {
            setIsSettling(true);
            try {
              await settleBet(bet.id, settleSelection);
              onBetSettled(settleSelection);
              Alert.alert("Success!", "The bet has been settled.");
              closeSheet();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Could not settle bet.");
            } finally {
              setIsSettling(false);
            }
          },
        },
      ]
    );
  };

  const rSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT / 2],
      [0.5, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <Modal transparent visible={isVisible} onRequestClose={closeSheet} animationType="none">
      {/** Backdrop (used for closing modal + adjust background opacity) */}
      <Pressable onPress={closeSheet} style={styles.overlay}>
        <Reanimated.View style={[styles.backdrop, rBackdropStyle]} />
      </Pressable>
      <Reanimated.View style={[styles.sheetContainer, rSheetStyle]}>
        <View style={styles.settleHeader}>
          <Text style={styles.settleTitle}>Time to settle! 🧑‍⚖️</Text>
        </View>
        <Text style={styles.settleSubtitle}>
          Select the winning option to finalize the result and pay out all winners.
        </Text>
        {/* Options */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.optionsGrid}>
            {bet.options?.map((option, index) => {
              const isHostChoice = userPlacementIdx === index;
              return (
                <TouchableOpacity
                  key={`settle-${index}`}
                  onPress={() => setSettleSelection(index)}
                  style={[
                    styles.optionButton,
                    settleSelection === index && styles.optionSelected,
                    isHostChoice && styles.hostBetIndicator,
                  ]}
                >
                  {isHostChoice && (
                    <View style={styles.hostBetBadge}>
                      <Text style={styles.hostBetBadgeText}>Your Bet</Text>
                    </View>
                  )}
                  <Text style={[styles.optionText, settleSelection === index && styles.optionTextSelected]}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <TouchableOpacity
          onPress={handleSettleBet}
          disabled={settleSelection === null || isSettling}
          style={[styles.settleConfirmButton, settleSelection === null && styles.settleConfirmButtonDisabled]}
        >
          {isSettling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.settleConfirmButtonText}>Confirm Winner & Pay Out</Text>
          )}
        </TouchableOpacity>
      </Reanimated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F0FDF4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 30, // Increased top padding after removing grabber
    maxHeight: MAX_SHEET_HEIGHT
  },
  settleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  settleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#064E3B',
    marginLeft: 10,
  },
  settleSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  optionsGrid: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    width: "100%",
    minHeight: 70,
    justifyContent: "center",
    position: 'relative',
  },
  optionSelected: { 
    backgroundColor: "#10B981", 
    borderColor: "#047857",
  },
  hostBetIndicator: {
    borderColor: '#059669',
  },
  hostBetBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
  },
  hostBetBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  optionTextSelected: { color: "#FFFFFF" },
  settleConfirmButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  settleConfirmButtonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  settleConfirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
