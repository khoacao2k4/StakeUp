import { BetFilter } from "@/app/(app)/(tabs)/home";
import { getToken } from "./supabase";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Automatically attaches the auth token to every request.
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catches all API errors and standardizes the error message.
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // If the server sends a specific error message, use it.
    // Otherwise, fall back to a generic message.
    const errorMessage = error.response?.data?.error || 'An unexpected error occurred.';
    // Reject the promise with a clean error message
    return Promise.reject(new Error(errorMessage));
  }
);

export async function getProfile() {
  const { data } = await api.get('/user/me');
  return data;
}

export async function updateProfile(profileData: FormData) {
  const { data } = await api.patch('/user/me', profileData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getUserBetsHistory() {
  const { data } = await api.get('/user/me/history');
  return data;
}

interface BetInfo { 
  title: string; 
  description: string; 
  options?: { text: string; }[]; 
  closed_at: Date; 
}

export async function createBet(bet: BetInfo) {
  const { data } = await api.post('/bets', bet);
  return data;
}

export async function getListBets(page: number = 0, filter: BetFilter = "newest") {
  const { data } = await api.get(`/bets?page=${page}&filter=${filter}`);
  return data;
}

export async function getBetDetails(bet_id: string) {
  const { data } = await api.get(`/bets/${bet_id}`);
  return data;
}

export async function updateBet(bet_id: string, bet_info: Partial<BetInfo>) {
  const { data } = await api.patch(`/bets/${bet_id}`, bet_info);
  return data;
}

export async function placeBet(bet_id: string, option_idx: number, amount: number) {
  const payload = { option_idx, amount };
  const { data } = await api.post(`/bets/${bet_id}/placement`, payload);
  return data;
}

export async function getUserBetPlacement(bet_id: string) {
  const { data } = await api.get(`/bets/${bet_id}/placement`);
  return data;
}

export async function settleBet(bet_id: string, winning_option_idx: number) {
  const payload = { winning_option_idx };
  const { data } = await api.post(`/bets/${bet_id}/settle`, payload);
  return data;
}

export async function cancelBet(bet_id: string) {
  const { data } = await api.post(`/bets/${bet_id}/cancel`);
  return data;
}