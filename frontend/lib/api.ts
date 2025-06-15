import { getToken } from "./supabase";
import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL =
  "";

export async function getProfile() {
  const token = await getToken();
  if (!token) throw new Error("No token found");

  const response = await axios.get(`${API_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response.data);
  return response.data;
}
