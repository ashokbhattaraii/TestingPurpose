import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname === "/login" || pathname === "/";
    const isProtectedPage =
        pathname.startsWith("/dashboard") || pathname.startsWith("/requests");

    // No token
    if (!token) {
        if (isProtectedPage) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    // Verify token
    let isValid = false;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        isValid = true;
    } catch (err) {
        // ✅ Only delete cookie + redirect if accessing a meaningful page
        // DO NOT delete cookie on every failed verify — it may be a timing issue
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("access_token");
        return response;
    }

    // Valid token on auth page → go to dashboard
    if (isAuthPage && isValid) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/).*)",
    ],
};