const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://oumsbackend-hvhgvh.up.railway.app/api/v1";

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
) {
  console.log("📡 Calling:", `${API_URL}${endpoint}`);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include", // ← MUST be here
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  console.log("📥 Response status:", response.status);

  if (response.status === 401) {
    console.error("❌ Unauthorized");
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || "API Error");
  }

  return response.json();
}

export async function getCurrentUser() {
  return fetchWithAuth("/auth/me");
}

export async function apiLogout() {
  return fetchWithAuth("/auth/logout", {
    method: "POST",
  });
}
