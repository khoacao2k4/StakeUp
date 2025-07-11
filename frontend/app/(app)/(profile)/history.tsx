import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getUserBetsHistory } from '@/lib/api'; // Assuming this function exists and works

// --- Interfaces ---
interface BetHistoryItem {
  id: string;
  title: string;
  status: 'open' | 'settled' | 'cancelled';
  amount: number;
  option: string;
  payout: number | null; // Payout can be null for active/cancelled bets
}

// --- Bet History Card Component ---
const BetHistoryCard = ({ item }: { item: BetHistoryItem }) => {
  // Corrected logic for determining win/loss state
  const isWin = item.status === 'settled' && item.payout !== null && item.payout > 0;
  const isLoss = item.status === 'settled' && (item.payout === null || item.payout <= 0);
  const isActive = item.status === 'open';

  const getStatusStyle = () => {
    if (isWin) return styles.statusWin;
    if (isLoss) return styles.statusLoss;
    if (isActive) return styles.statusActive;
    return styles.statusCancelled; // for 'cancelled' status
  };

  const StatusIcon = ({size = 14, color = '#FFFFFF'}: {size?: number; color?: string}) => {
    if (isWin) return <FontAwesome5 name="trophy" size={size} color={color}  />
    if (isLoss) return <Feather name="x-circle" size={size} color={color} />
    if (isActive) return <FontAwesome6 name="hourglass-half" size={size} color={color} />;
    return <MaterialCommunityIcons name="cash-refund" size={size} color={color} />
  };

  const getStatusText = () => {
    if (isWin) return `+${Math.round(item.payout || 0)}`;
    if (isLoss) return `-${item.amount}`;
    if (isActive) return 'Active';
    return 'Refunded';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/bets/${item.id}`)}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>Pick: {item.option}</Text>
        <Text style={styles.cardWager}>Wagered: {item.amount} Coins</Text>
      </View>
      <View style={[styles.statusBadge, getStatusStyle()]}>
        <StatusIcon />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
    </TouchableOpacity>
  );
};


export default function HistoryScreen() {
  const [betHistory, setBetHistory] = useState<BetHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getUserBetsHistory();
      setBetHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      Alert.alert("Error", "Could not load your history.");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />;
    }
    return (
      <FlatList
        data={betHistory}
        renderItem={({ item }) => <BetHistoryCard item={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Feather name="archive" size={48} color="#A7F3D0" />
                <Text style={styles.emptyText}>You haven't placed any bets yet.</Text>
                <Text style={styles.emptySubtitle}>Your past bets will appear here.</Text>
            </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bet History</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: { position: 'absolute', left: 20 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#064E3B" },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#047857',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 14,
    color: '#059669',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  cardWager: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 8,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusWin: { backgroundColor: '#10B981' },
  statusLoss: { backgroundColor: '#EF4444' },
  statusActive: { backgroundColor: '#3B82F6' },
  statusCancelled: { backgroundColor: '#6B7280' },
});
