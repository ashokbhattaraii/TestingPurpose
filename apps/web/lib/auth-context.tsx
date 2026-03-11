"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, apiLogout } from "./api";
import router from "next/navigation";

interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
  photoURL?: string;
  department?: string;
  org_unit?: string;
  job_title?: string;
  employment_type?: string;
  status?: "active" | "inactive" | "suspended" | string;
  lastLogin?: string | Date | null;
  notificationPreferences?: NotificationPreferences;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, [pathname]);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      console.log("User loaded:", userData?.email);
      setUser(userData);

      // If user is logged in and on a public route, redirect to dashboard
      const publicRoutes = ["/", "/login"];
      if (publicRoutes.includes(pathname)) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.log("No user found");
      setUser(null);

      // If user is not logged in and on a protected route, redirect to login
      const publicRoutes = ["/", "/login"];
      if (!publicRoutes.includes(pathname)) {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await loadUser();
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };
  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type NotificationPreferences = {
  emailNotifications: boolean;
  announcements: boolean;
  assignments: boolean;
};
