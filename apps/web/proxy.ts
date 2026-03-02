import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // 1. VERCEL BUILD & PREFETCH BYPASS
  // Prevents the "Internal Error" during deployment and unnecessary checks for background pre-fetching
  const isPrefetch = request.headers.get("next-router-prefetch") === "1";
  const isBuildRequest = request.headers.get("x-middleware-preflight") === "1";

  if (isPrefetch || isBuildRequest || pathname.includes("_next")) {
    return NextResponse.next();
  }

  // 2. TOKEN VERIFICATION
  let isValid = false;
  let payload = null;
  const secretKey = process.env.JWT_SECRET;

  if (token && secretKey) {
    try {
      const secret = new TextEncoder().encode(secretKey);

      // Verify with 10s clock tolerance to prevent "instant deletion" 
      // caused by minor server time differences (clock skew)
      const verified = await jwtVerify(token, secret, {
        clockTolerance: 10,
      });

      payload = verified.payload;
      isValid = true;
    } catch (err) {
      console.error("JWT Verification failed:", err instanceof Error ? err.message : "Invalid token");

      // ONLY delete the cookie if the user is attempting to access a PROTECTED route.
      // This prevents the redirect loop on the login/landing pages.
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/requests")) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("access_token");
        return response;
      }
    }
  }

  // 3. DEFINE ROUTE GROUPS
  const isAuthPage = pathname === "/login" || pathname === "/";
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/requests");

  // 4. NAVIGATION LOGIC

  // Logic: If logged in, don't allow access to Login/Landing pages
  if (isAuthPage && isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Logic: If NOT logged in, don't allow access to Protected pages
  if (isProtectedPage && !isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Ensure the matcher excludes static assets and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};