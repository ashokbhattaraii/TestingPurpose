import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard-shell";
import { jwtVerify } from "jose";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
  } catch (err) {
    redirect("/login");
  }

  return (
    <DashboardShell>{children}</DashboardShell>
  );
}
