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
  announcements,
  users,
  analyticsData,
  lunchTokens,
  notifications,
  getSortedAnnouncements,
} from "./data";
import axiosInstance from "./axios/axios";

// Simulate async fetch
function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// Note: Request-related hooks have been moved to @/hooks/request/ folder

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => delay(getSortedAnnouncements()),
  });
}

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
  });
}


export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: import("./types").UserRole;
    }) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.role = role;
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

export function useNotifications(userId?: string, includeRead = false) {
  return useQuery({
    queryKey: ["notifications", userId, includeRead],
    queryFn: () => {
      let filtered = userId
        ? notifications.filter((n) => n.userId === userId)
        : [...notifications];
      if (!includeRead) {
        filtered = filtered.filter((n) => !n.read);
      }
      return delay([...filtered]);
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => {
      const notif = notifications.find((n) => n.id === notificationId);
      if (notif) {
        notif.read = true;
      }
      return delay(notif);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => {
      notifications.forEach((n) => {
        if (n.userId === userId && !n.read) {
          n.read = true;
        }
      });
      return delay(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// --- Announcement Hooks ---

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      title,
      content,
      authorId,
      authorName,
    }: {
      title: string;
      content: string;
      authorId: string;
      authorName: string;
    }) => {
      const announcement = {
        id: `a${announcements.length + 1}`,
        title,
        content,
        author: authorId,
        authorName,
        createdAt: new Date().toISOString(),
        pinned: false,
      };
      announcements.unshift(announcement);
      return delay(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function usePinAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      pinned,
    }: {
      announcementId: string;
      pinned: boolean;
    }) => {
      const announcement = announcements.find((a) => a.id === announcementId);
      if (announcement) {
        announcement.pinned = pinned;
      }
      return delay(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

