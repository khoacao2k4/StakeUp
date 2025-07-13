import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BetCard, BetCardSkeleton } from "@/components/BetCard";
import { getListBets } from "@/lib/api";
import { Profile } from "@/app/(app)/(tabs)/profile";

export interface Bet {
  id: string;
  created_at: string;
  title: string;
  description: string;
  options?: { text: string }[];
  closed_at?: string;
  settled_option?: number | null;
  participant_count?: number;
  profiles: Profile | null;
  status?: string;
  odds?: number[];
}

const MAX_BETS_PER_PAGE = 10;

export default function HomeScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [intialloading, setIntialLoading] = useState(true); //iniial load
  const [refreshing, setRefreshing] = useState(false); //after refresh 

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadInitialBets = async () => {
    try {
      const initialBets = await getListBets(0);
      setBets(initialBets);
      setPage(1); // next page
      setHasMore(initialBets.length === MAX_BETS_PER_PAGE);
    } catch (error) {
      Alert.alert("Error", "Failed to load bets. Please try again.");
    }
  };

  const loadMoreBets = async () => {
    console.log("check load more");
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextBets = await getListBets(page);
      if (nextBets.length > 0) {
        setBets([...bets, ...nextBets]);
        setPage(page + 1);
        setHasMore(nextBets.length === MAX_BETS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load bets. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  // iniial load
  useEffect(() => {
    loadInitialBets()
      .finally(() => setIntialLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await loadInitialBets();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
    {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home Feed</Text>
      </View>
      {intialloading ? (
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
          onEndReached={loadMoreBets} // Function to call when end is reached
          onEndReachedThreshold={0.5} // number of screen lengths you should be from the bottom before it fires the event.
          ListFooterComponent={() => {
            if (!loadingMore) return null;
            return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#10B981" />;
          }}
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
