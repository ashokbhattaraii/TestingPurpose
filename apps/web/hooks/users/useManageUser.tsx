import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";

type upateUserRoleType = {
    userId: string,
    role: "ADMIN" | "EMPLOYEE" | "SUPER_ADMIN"
}
export function useUpdateUserRole() {
    return useMutation({
        mutationKey: ['update-user-role'],
        mutationFn: async (paylaod: upateUserRoleType) => {
            const res = await axiosInstance.patch('/user/update-role', paylaod)
            return res.data
        }

    })
}

