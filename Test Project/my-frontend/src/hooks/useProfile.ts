// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL;

export interface Preferences {
  theme?: "light" | "dark";
  dateFormat?: string;
}

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  timeZone?: string;
  preferences?: Preferences;
}

export function useProfile(token: string | null) {
  return useQuery<UserProfile, Error>({
    // 1) the key
    queryKey: ["profile", token],
    // 2) the fetcher
    queryFn: async (): Promise<UserProfile> => {
      if (!token) throw new Error("No auth token");
      const res = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return (await res.json()) as UserProfile;
    },
    // 3) optional config:
    enabled: Boolean(token),
    staleTime: 5 * 60_000, // cache fresh for 5 minutes
    retry: 1, // retry once on failure
    refetchOnWindowFocus: false, // up to you
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Partial<UserProfile>>({
    mutationFn: async (updates) => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
    },
    onSuccess: () => {
      // Tell React Query “invalidate any queries whose key matches ['profile']”
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
