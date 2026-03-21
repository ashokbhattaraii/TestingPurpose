import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";
import { User } from "@/lib/types";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axiosInstance.get<User[]>("/users");
      return response.data;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      roles,
    }: {
      userId: string;
      roles: string[];
    }) => {
      const response = await axiosInstance.patch<User>(`/users/${userId}/role`, { roles });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
