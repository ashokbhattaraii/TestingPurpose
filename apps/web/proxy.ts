import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Define Protected and Auth Routes
  const isAuthPage = pathname === "/login" || pathname === "/";
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/requests");

  // 1. If no token exists at all, skip verification entirely
  if (!token) {
    if (isProtectedPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Token exists — verify it
  let isValid = false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
    isValid = true;
  } catch (err) {
    // Token is expired or tampered — clear it and send to login
    if (isProtectedPage || isAuthPage) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      return response;
    }
    return NextResponse.next();
  }

  // 3. Logged in users shouldn't access auth pages
  if (isAuthPage && isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Not logged in users shouldn't access protected pages
  if (isProtectedPage && !isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - API routes (so your auth controller can set cookies freely)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};