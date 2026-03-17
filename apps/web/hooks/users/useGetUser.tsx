import axiosInstance from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import { EmployeeType } from "@/lib/type/employeeType";

//get all users
export function useGetUser() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/user/employees");
      const data = response.data as EmployeeType[];
      return data.map((u) => ({
        ...u,
        roles: u.roles?.map((r) => r.toUpperCase()),
      }));
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 5 * 1000, // 5 minutes
    retry: true,
  });
}

export function useGetAdminUser() {
  return useQuery({
    queryKey: ["adminUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/user/admin");
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map((u: any) => ({
          ...u,
          roles: u.roles?.map((r: string) => r.toUpperCase()),
        }));
      }
      const u = data as any;
      return {
        ...u,
        roles: u.roles?.map((r: string) => r.toUpperCase()),
      };
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 5 * 1000, // 5 minutes
    retry: true,
  });
}

export function useGetUserById(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/user/${userId}`);
      const data = response.data as EmployeeType;
      return {
        ...data,
        roles: data.roles?.map((r) => r.toUpperCase()),
      };
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    retry: true,
  });
}



