import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define routes
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(path);

  // All non-public routes are protected
  const isProtectedRoute = !isPublicRoute;

  // Read cookie from request headers.
  // CRITICAL NOTE FOR CROSS-DOMAIN (Vercel):
  // If the backend API sets the cookie on a different domain (e.g. api.vercel.app)
  // than the frontend (e.g. app.vercel.app), this Next.js middleware WILL NOT receive the cookie,
  // making server-side route protection fail in production.
  // We have fallback protection in the client-side AuthProvider (auth-context.tsx) which handles this gracefully.
  const token = request.cookies.get("access_token")?.value;

  // Logic if user has a token
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  // Logic if user has NO token
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - all files with an extension (e.g. logo.png, logo.svg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
