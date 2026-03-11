import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios";

type upateUserRoleType = {
    userId: string,
    roles: string[]
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

