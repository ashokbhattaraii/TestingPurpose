import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import HomePageClient from "@/components/home-page-client";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);
      redirect("/dashboard");
    } catch (err) {
      // Invalid token, just show home
    }
  }

  return <HomePageClient />;
}