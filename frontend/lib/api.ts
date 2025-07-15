import { BetFilter } from "@/app/(app)/(tabs)/home";
import { getToken } from "./supabase";
import axios from "axios";

const API_BASE_URL =
  "https://200fad9d8c1f.ngrok-free.app";

export async function getProfile() {
  const token = await getToken();
  if (!token) throw new Error("No token found");

  const response = await axios.get(`${API_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200 || !response.data) throw new Error(response.data.error);
  return response.data;
}

export async function updateProfile(profile: any) {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await axios.patch(`${API_BASE_URL}/user/me`, profile, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200 || !response.data) throw new Error("Failed to update profile");
  return response.data;
}

export async function getUserBetsHistory() {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await axios.get(`${API_BASE_URL}/user/me/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200 || !response.data) throw new Error(response.data.error);
  return response.data;
}

interface BetInfo { 
  title: string; 
  description: string; 
  options?: { text: string; }[]; 
  closed_at: Date; 
}

export async function createBet(bet: BetInfo) {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await axios.post(`${API_BASE_URL}/bets`, bet, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 201 || !response.data) throw new Error(response.data.error);
  return response.data;
}

export async function getListBets(page: number = 0, filter: BetFilter = "newest") {
  const response = await axios.get(`${API_BASE_URL}/bets?page=${page}&filter=${filter}`);
  if (response.status !== 200 || !response.data) throw new Error(response.data.error);
  return response.data;
}

export async function getBetDetails(bet_id: string) {
  const response = await axios.get(`${API_BASE_URL}/bets/${bet_id}`);
  if (response.status !== 200 || !response.data) throw new Error(response.data.error);
  return response.data;
}

export async function updateBet(bet_id: string, bet_info: BetInfo) {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await axios.patch(`${API_BASE_URL}/bets/${bet_id}`, bet_info, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200 || !response.data) throw new Error(response.data.error);
  return response.data;
}

export async function placeBet(bet_id: string, option_idx: number, amount: number) {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const payload = { option_idx, amount };
  const response = await axios.post(`${API_BASE_URL}/bets/${bet_id}/placement`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 201 || !response.data) {
    throw new Error(response.data.error);
  }
  return response.data;
}

export async function getBetPlacement(bet_id: string) {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await axios.get(`${API_BASE_URL}/bets/${bet_id}/placement`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) throw new Error(response.data.error);
  return response.data;
}

export async function settleBet(bet_id: string, option_idx: number) {
  const token = await getToken();
  if (!token) throw new Error("No token found");

  const payload = { option_idx };
  const response = await axios.post(`${API_BASE_URL}/bets/${bet_id}/settle`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) throw new Error(response.data.error);
  return response.data;
}

export async function cancelBet(bet_id: string) {
  const token = await getToken();
  if (!token) throw new Error("No token found");
  const response = await axios.post(`${API_BASE_URL}/bets/${bet_id}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) throw new Error(response.data.error);
}