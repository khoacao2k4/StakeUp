// File: app/bet/[id].tsx
// Purpose: This is the new, dynamic screen that displays the details for a single bet.

import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Adjust path if needed
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- Type Definitions ---
interface Profile {
  username: string;
  avatar_path: string;
  full_name: string;
}
interface Bet {
  id: string;
  created_at: string;
  title: string;
  description: string;
  options: { text: string }[];
  close_date: string;
  profiles: Profile | null;
  creator_avatar_url?: string;
}

// --- Skeleton Placeholder ---
const BetDetailSkeleton = () => (
    <View style={styles.container}>
        <View style={styles.header}>
            <View style={[styles.placeholder, { width: 30, height: 30, borderRadius: 15 }]} />
        </View>
        <View style={styles.content}>
            <View style={[styles.placeholder, { width: '80%', height: 30, borderRadius: 8, marginBottom: 10 }]} />
            <View style={[styles.placeholder, { width: '50%', height: 20, borderRadius: 8, marginBottom: 20 }]} />
            <View style={[styles.placeholder, { width: '100%', height: 60, borderRadius: 8, marginBottom: 30 }]} />
            <View style={[styles.placeholder, { width: '100%', height: 50, borderRadius: 12, marginBottom: 12 }]} />
            <View style={[styles.placeholder, { width: '100%', height: 50, borderRadius: 12, marginBottom: 12 }]} />
        </View>
    </View>
);


export default function BetDetailScreen() {
    const { id } = useLocalSearchParams();
    const [bet, setBet] = useState<Bet | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [wagerAmount, setWagerAmount] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchBetDetails = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('bets')
                .select('*, profiles(*)')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error("Error fetching bet details:", error);
                Alert.alert("Error", "Could not load bet details.");
            } else {
                setBet(data as Bet);
            }
            setLoading(false);
        };
        fetchBetDetails();
    }, [id]);

    const handlePlaceBet = () => {
        Keyboard.dismiss();
        Alert.alert(
            "Confirm Bet",
            `Are you sure you want to bet ${wagerAmount} coins on "${bet?.options[selectedOption!].text}"?`,
            [
                { text: "Cancel", style: "cancel", onPress: () => setSelectedOption(null) },
                { text: "Confirm", onPress: () => {
                    // TODO: Implement secure backend logic (Edge Function) to place the bet
                    console.log(`Betting ${wagerAmount} on option index ${selectedOption}`);
                    setSelectedOption(null);
                    setWagerAmount('');
                    Alert.alert("Bet Placed!", "Your bet has been recorded.");
                }}
            ]
        );
    };

    if (loading) {
        return <BetDetailSkeleton />;
    }

    if (!bet) {
        return <View style={styles.container}><Text>Bet not found.</Text></View>;
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="chevron-left" size={26} color="#064E3B" />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.content}>
                        <Text style={styles.title}>{bet.title}</Text>
                        <Text style={styles.description}>{bet.description}</Text>

                        <View style={styles.creatorInfo}>
                           <Image source={{ uri: bet.creator_avatar_url || 'https://placehold.co/100x100/A7F3D0/064E3B?text=?' }} style={styles.avatar}/>
                           <View>
                                <Text style={styles.creatorLabel}>Created By</Text>
                                <Text style={styles.creatorName}>@{bet.profiles?.username || 'anonymous'}</Text>
                           </View>
                        </View>
                        
                        <Text style={styles.optionsTitle}>Choose an Option</Text>
                        {bet.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionButton, selectedOption === index && styles.optionSelected]}
                                onPress={() => setSelectedOption(index)}
                            >
                                <Text style={[styles.optionText, selectedOption === index && styles.optionTextSelected]}>{option.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                
                {/* --- Place Bet Section --- */}
                {selectedOption !== null && (
                    <View style={styles.footer}>
                         <LinearGradient colors={['rgba(240, 253, 244, 0)', 'rgba(240, 253, 244, 1)', '#F0FDF4']} style={styles.footerGradient} />
                        <Text style={styles.wagerLabel}>Enter Your Wager</Text>
                        <View style={styles.wagerInputContainer}>
                            <Feather name="dollar-sign" size={20} color="#059669" style={styles.coinIcon} />
                            <TextInput
                                style={styles.wagerInput}
                                placeholder="0"
                                keyboardType="number-pad"
                                value={wagerAmount}
                                onChangeText={setWagerAmount}
                            />
                            <TouchableOpacity
                                style={[styles.placeBetButton, !wagerAmount && styles.placeBetButtonDisabled]}
                                onPress={handlePlaceBet}
                                disabled={!wagerAmount}
                            >
                                <Text style={styles.placeBetButtonText}>Place Bet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F0FDF4" },
    header: { padding: 16, flexDirection: 'row', alignItems: 'center' },
    backButton: { padding: 4 },
    scrollContainer: { flexGrow: 1, paddingBottom: 150 },
    content: { paddingHorizontal: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#064E3B', marginBottom: 8, lineHeight: 36 },
    description: { fontSize: 16, color: '#047857', lineHeight: 24, marginBottom: 24 },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D1FAE5',
        marginBottom: 30,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    creatorLabel: { fontSize: 14, color: '#059669' },
    creatorName: { fontSize: 16, fontWeight: '600', color: '#064E3B' },
    optionsTitle: { fontSize: 20, fontWeight: 'bold', color: '#064E3B', marginBottom: 12 },
    optionButton: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        alignItems: 'center'
    },
    optionSelected: {
        backgroundColor: '#10B981',
        borderColor: '#047857',
    },
    optionText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
    optionTextSelected: { color: '#FFFFFF' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 30, // Extra space for home bar
        backgroundColor: 'transparent'
    },
    footerGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 150,
    },
    wagerLabel: { fontSize: 14, fontWeight: '600', color: '#059669', textAlign: 'center', marginBottom: 10 },
    wagerInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingLeft: 16,
        borderWidth: 2,
        borderColor: '#A7F3D0'
    },
    coinIcon: { marginRight: 8 },
    wagerInput: { flex: 1, height: 60, fontSize: 20, fontWeight: 'bold', color: '#064E3B' },
    placeBetButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 24,
        height: '100%',
        justifyContent: 'center',
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
    },
    placeBetButtonDisabled: { backgroundColor: '#A7F3D0' },
    placeBetButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    placeholder: { backgroundColor: '#E5E7EB', borderRadius: 8 },
});
