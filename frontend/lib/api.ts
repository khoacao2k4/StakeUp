import { getToken } from "./supabase";
import axios from "axios";

const API_BASE_URL =
  "https://caed-2600-6c44-11f0-ee30-682a-7112-bed6-5243.ngrok-free.app";

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
  console.log(profile);
  const response = await axios.patch(`${API_BASE_URL}/user/me`, profile, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200 || !response.data) throw new Error("Failed to update profile");
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
  if (response.status !== 200 || !response.data) throw new Error(response.data.error);
  return response.data;
}

export async function getAllBets(page: number = 1) {
  const response = await axios.get(`${API_BASE_URL}/bets?page=${page}`);
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