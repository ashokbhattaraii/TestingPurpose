"use client";

import { useMutation } from "@tanstack/react-query";

async function startGoogleLogin(): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://testing-purpose-api.vercel.app/api/v1";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set");
  }

  window.location.href = `${baseUrl}/auth/google`;
}

export function useLogin() {
  const mutation = useMutation({
    mutationKey: ["auth", "google-login"],
    mutationFn: startGoogleLogin,
  });

  return {
    loginWithGoogle: mutation.mutate,
    loginWithGoogleAsync: mutation.mutateAsync,
    isGoogleLoginPending: mutation.isPending,
    googleLoginError: mutation.error,
  };
}
