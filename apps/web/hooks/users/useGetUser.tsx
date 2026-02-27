import axiosInstance from "@/lib/axios/axios";
import { useQuery } from "@tanstack/react-query";
import { EmployeeType } from "@/lib/type/employeeType";

//get all users
export function useGetUser() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/user/employees");
      return response.data as EmployeeType[]; // Ensure the response is typed correctly
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

      return response.data as EmployeeType;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 5 * 1000, // 5 minutes
    retry: true,
  });
}
