import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginPage } from "@/components/login-page";
import { jwtVerify } from "jose";

export default async function LoginRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);
      redirect("/dashboard");
    } catch (err) {
      // Invalid token, allow them to view login
    }
  }

  return <LoginPage />;
}
