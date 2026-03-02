import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Verify the Token
  let isValid = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret); // MUST be awaited
      isValid = true;
    } catch (err) {
      // If token is invalid/expired, it's best to delete the cookie
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      return response;
    }
  }

  // 2. Define Protected and Auth Routes
  const isAuthPage = pathname === "/login" || pathname === "/";
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/requests");

  // 3. Logic: If logged in, don't allow access to Login/Landing pages
  if (isAuthPage && isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Logic: If NOT logged in, don't allow access to Protected pages
  if (isProtectedPage && !isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
