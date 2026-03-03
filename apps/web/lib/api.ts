const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

import axiosInstance from "./axios/axios";

export async function fetchWithAuth(
  endpoint: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {},
) {
  console.log("Calling:", `${API_URL}${endpoint}`);

  try {
    const response = await axiosInstance({
      url: endpoint,
      method: (options.method as any) || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      data: options.body
        ? typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body
        : undefined,
    });

    console.log("Response status:", response.status);

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    console.log("📥 Response status:", status);

    if (status === 401) {
      console.error("Unauthorized");
      throw new Error("Unauthorized");
    }

    const message =
      error.response?.data?.message || error.message || "API Error";
    throw new Error(message);
  }
}

export async function getCurrentUser() {
  return fetchWithAuth("/auth/me");
}

export async function apiLogout() {
  return fetchWithAuth("/auth/logout", {
    method: "POST",
  });
}
