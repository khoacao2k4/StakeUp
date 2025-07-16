import { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BetCard, BetCardSkeleton } from "@/components/BetCard";
import { getListBets } from "@/lib/api";
import { Profile } from "@/app/(app)/(tabs)/profile";
import { useNavigation } from "expo-router";

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
export type BetFilter = 'newest' | 'settled' | 'ending_soon';

const FilterTabs = ({ activeFilter, onFilterChange }: { activeFilter: BetFilter, onFilterChange: (filter: BetFilter) => void }) => {
  const filters: { label: string; value: BetFilter }[] = [
    { label: "Newest", value: "newest" },
    { label: "Ending Soon", value: "ending_soon" },
    { label: "Settled", value: "settled" },
  ];

  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          style={[styles.filterButton, activeFilter === filter.value && styles.activeFilterButton]}
          onPress={() => onFilterChange(filter.value)}
        >
          <Text style={[styles.filterText, activeFilter === filter.value && styles.activeFilterText]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList<Bet>>(null);

  // State
  const [bets, setBets] = useState<Bet[]>([]);
  const [intialloading, setIntialLoading] = useState(true); //iniial load
  const [refreshing, setRefreshing] = useState(false); //after refresh 

  // Filter
  const [activeFilter, setActiveFilter] = useState<BetFilter>('newest');

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadInitialBets = async (filter: BetFilter) => {
    try {
      const initialBets = await getListBets(0, filter);
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
      const nextBets = await getListBets(page, activeFilter);
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

  const handleFilterChange = (filter: BetFilter) => {
    setActiveFilter(filter);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    onRefresh(filter);
  };

  // iniial load
  useEffect(() => {
    loadInitialBets(activeFilter)
      .finally(() => setIntialLoading(false));
  }, []);

  const onRefresh = useCallback(async (filter?: BetFilter) => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    await loadInitialBets(filter || activeFilter);
    await setTimeout(() => { // cause a delay to show loading briefly
      setRefreshing(false);
    }, 500);
  }, [activeFilter]);

  useEffect(() => {
    // @ts-ignore
    const tabPressListener = navigation.addListener('tabPress', (e) => {
      // Check if the home tab is already focused
      if (navigation.isFocused()) {
        // @ts-ignore
        e.preventDefault();
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        onRefresh();
      }
    });

    return tabPressListener;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
    {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home Feed</Text>
      </View>

      {/* Filter Tabs */}
      <FilterTabs 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange}
      />

      {intialloading ? (
        <View style={styles.content}>
          <BetCardSkeleton />
          <BetCardSkeleton />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
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
    // borderBottomWidth: 1,
    // borderBottomColor: "#D1FAE5",
    // backgroundColor: "#F0FDF4",
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
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  activeFilterText: {
    color: '#059669',
  },
});
