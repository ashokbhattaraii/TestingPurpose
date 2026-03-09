"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginPage } from "@/components/login-page";

export default function LoginRoute() {
  // login component
  return <LoginPage />;
}
