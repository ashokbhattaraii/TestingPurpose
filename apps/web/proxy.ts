import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // 1. VERCEL BUILD BYPASS
  // Prevents "Internal Error" by allowing the build server to crawl pages 
  // without triggering a redirect loop.
  if (
    request.headers.get("x-middleware-preflight") ||
    pathname.includes("_next") ||
    process.env.VERCEL_ENV === "preview" && !token // Optional: easier debugging in preview
  ) {
    return NextResponse.next();
  }

  // 2. TOKEN VERIFICATION
  let isValid = false;
  const secretKey = process.env.JWT_SECRET;

  if (token && secretKey) {
    try {
      const secret = new TextEncoder().encode(secretKey);
      await jwtVerify(token, secret);
      isValid = true;
    } catch (err) {
      console.error("Middleware JWT Error:");
      // If we are on a protected page and the token is actually invalid, 
      // redirect and clear the junk cookie.
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/requests")) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("access_token");
        return response;
      }
    }
  }

  // 3. DEFINE ROUTE GROUPS
  const isAuthPage = pathname === "/login" || pathname === "/";
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/requests");

  // 4. REDIRECT LOGIC

  // If logged in, don't allow access to Login/Landing pages
  if (isAuthPage && isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If NOT logged in, don't allow access to Protected pages
  if (isProtectedPage && !isValid) {
    // Only redirect if it's not a build-time request
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