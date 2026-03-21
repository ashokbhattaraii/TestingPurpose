import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { LunchToken, MealPreference } from "@/lib/types";

export function useLunchTokens(date?: string) {
  return useQuery<LunchToken[]>({
    queryKey: ["lunchTokens", date],
    queryFn: async () => {
      const params = date ? { date } : {};
      const response = await axiosInstance.get<LunchToken[]>("/lunch-tokens", { params });
      return response.data;
    },
  });
}

export function useLunchTokenForUser(userId: string, date: string) {
  return useQuery<LunchToken | null>({
    queryKey: ["lunchToken", userId, date],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<LunchToken>(`/lunch-tokens/user/${userId}`, { params: { date } });
        return response.data;
      } catch (e) {
        return null;
      }
    },
  });
}

export function useCollectLunchToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      userName: string;
      preferredLunchOption: MealPreference;
    }) => {
      const response = await axiosInstance.post<LunchToken>("/lunch-tokens/collect", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lunchTokens"] });
      queryClient.invalidateQueries({ queryKey: ["lunchToken"] });
    },
  });
}
