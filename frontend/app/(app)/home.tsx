import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase"; // Adjust path if needed
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { BetCardSkeleton } from "@/components/BetCard";

// --- Type Definitions ---
interface Profile {
  username: string;
  avatar_path: string;
}
interface Bet {
  id: string;
  created_at: string;
  title: string;
  description: string;
  close_date: string;
  participant_count: number; // To show how many people have joined
  profiles: Profile | null;
  creator_avatar_url?: string;
}

// --- API & Caching Logic ---
const fetchAndCacheBets = async (): Promise<Bet[]> => {
  const { data: betsData, error } = await supabase
    .from("bets")
    .select("*, profiles!inner(username, avatar_path)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("Error fetching bets:", error);
    return [];
  }

  const processedBets = await Promise.all(
    (betsData as Bet[]).map(async (bet, index) => {
      const mockCloseDate = new Date();
      mockCloseDate.setHours(mockCloseDate.getHours() + (index + 1) * 6);
      bet.close_date = mockCloseDate.toISOString();
      // Mocking participant count for demonstration
      bet.participant_count = Math.floor(Math.random() * 100) + 2;

      if (!bet.profiles?.avatar_path) return bet;
      const avatarPath = bet.profiles.avatar_path;
      const cacheKey = `signed-url-cache:${avatarPath}`;
      const cachedItem = await AsyncStorage.getItem(cacheKey);
      if (cachedItem) {
        const { url, expires } = JSON.parse(cachedItem);
        if (expires > Date.now() + 60 * 1000)
          return { ...bet, creator_avatar_url: url };
      }
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("avatars")
          .createSignedUrl(avatarPath, 3600);
      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
        return bet;
      }
      const newUrl = signedUrlData.signedUrl;
      const newCacheItem = { url: newUrl, expires: Date.now() + 3600 * 1000 };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(newCacheItem));
      return { ...bet, creator_avatar_url: newUrl };
    })
  );
  return processedBets as Bet[];
};


const BetCard = ({ bet }: { bet: Bet }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference =
        new Date(bet.close_date).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft("Closed");
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [bet.close_date]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri:
                bet.creator_avatar_url ||
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
              {bet.participant_count} Bettors
            </Text>
          </View>
          <View style={styles.footerStat}>
            <Feather name="clock" size={14} color="#059669" />
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

// --- Main Screen Component ---
export default function HomeScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBets = async () => {
    const data = await fetchAndCacheBets();
    setBets(data);
  };
  useEffect(() => {
    setLoading(true);
    loadBets().finally(() => setLoading(false));
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

// --- FINAL REDESIGNED Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#064E3B" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
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
    width: 28,
    height: 28,
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
