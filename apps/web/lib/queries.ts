import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ServiceRequest,
  RequestStatus,
  LunchToken,
  MealPreference,
  Notification,
} from "./types";
import {
  serviceRequests,
  users,
  analyticsData,
  lunchTokens,
  notifications,
} from "./data";
import axiosInstance from "./axios/axios";

// Simulate async fetch
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// Note: Request-related hooks have been moved to @/hooks/request/ folder


export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => delay([...users]),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => delay({ ...analyticsData }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    retry: true,
  });
}


export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      roles,
    }: {
      userId: string;
      roles: string[];
    }) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.roles = roles;
      }
      return delay(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}


// --- Lunch Token Hooks ---

export function useLunchTokens(date?: string) {
  return useQuery({
    queryKey: ["lunchTokens", date],
    queryFn: () => {
      const filtered = date
        ? lunchTokens.filter((t) => t.date === date)
        : lunchTokens;
      return delay([...filtered]);
    },
  });
}

export function useLunchTokenForUser(userId: string, date: string) {
  return useQuery({
    queryKey: ["lunchToken", userId, date],
    queryFn: () => {
      const found = lunchTokens.find(
        (t) => t.userId === userId && t.date === date,
      );
      return delay(found || null);
    },
  });
}

export function useCollectLunchToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      userName,
      preferredLunchOption,
    }: {
      userId: string;
      userName: string;
      preferredLunchOption: MealPreference;
    }) => {
      const today = new Date().toISOString().split("T")[0];
      const existing = lunchTokens.find(
        (t) => t.userId === userId && t.date === today,
      );
      if (existing) {
        throw new Error("Token already collected for today");
      }
      const token: LunchToken = {
        id: `lt-${Date.now()}`,
        userId,
        userName,
        date: today,
        preferredLunchOption,
        collectedAt: new Date().toISOString(),
      };
      lunchTokens.unshift(token);
      return delay(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lunchTokens"] });
      queryClient.invalidateQueries({ queryKey: ["lunchToken"] });
    },
  });
}

// --- Notification Hooks ---

export function useNotifications(userId?: string) {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axiosInstance.get<Notification[]>("/notifications");
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000,
    retry: true,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await axiosInstance.patch<Notification>(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch("/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}


