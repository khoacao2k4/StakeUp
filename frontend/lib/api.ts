import { BetInfo } from "@/app/(app)/(tabs)/create";
import { getToken } from "./supabase";
import axios from "axios";

const API_BASE_URL =
  "https://6d15-2600-6c44-11f0-ee30-392d-faf8-482d-b54.ngrok-free.app";

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