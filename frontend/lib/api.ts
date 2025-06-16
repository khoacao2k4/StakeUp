import { getToken } from "./supabase";
import axios from "axios";
import { Profile } from "@/app/(app)/profile";

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
  if (response.status !== 200 || !response.data) throw new Error("Failed to fetch profile");
  //console.log(response.data);
  return response.data;
}

export async function updateProfile(profile: Profile) {
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