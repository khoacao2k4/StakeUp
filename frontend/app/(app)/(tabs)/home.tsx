import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BetCard, BetCardSkeleton } from "@/components/BetCard";
import { getAllBets } from "@/lib/api";
import { Profile } from "@/app/(app)/(tabs)/profile";

export interface Bet {
  id: string;
  created_at: string;
  title: string;
  description: string;
  options?: { text: string }[];
  closed_at?: string;
  settled_option?: string | null;
  participant_count?: number;
  profiles: Profile | null;
}

export default function HomeScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true); //iniial load
  const [refreshing, setRefreshing] = useState(false); //after refresh 

  const loadBets = async () => {
    getAllBets()
      .then((bets) => setBets(bets))
      .catch((error) => console.error("Failed to load bets", error));
  };

  // iniial load
  useEffect(() => {
    loadBets()
      .finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBets();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
    {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home Feed</Text>
      </View>
      {loading ? (
        <View style={styles.content}>
          <BetCardSkeleton />
          <BetCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={bets}
          renderItem={({ item }) => <BetCard bet={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F0FDF4" 
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#064E3B" 
  },
  content: { 
    paddingHorizontal: 16, 
    paddingTop: 16, 
    paddingBottom: 100 
  }
});
