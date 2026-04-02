"use client";

import { useMutation } from "@tanstack/react-query";

import { fetchWithAuth } from "../../lib/api";

async function startGoogleLogin(idToken: string): Promise<any> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  return fetchWithAuth("/auth", {
    method: "POST",
    body: { id_token: idToken },
  });
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
    loginWithGoogleSuccess: mutation.isSuccess,
    googleLoginError: mutation.error,
  };
}
