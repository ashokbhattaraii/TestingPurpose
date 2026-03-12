import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
    }

    if (token) {
        (await cookies()).set('access_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 2 * 60, // 7 days
        });
        console.log("Access token added")

        // Once the cookie is securely stored in the user's browser for the FRONTEND domain,
        // we redirect them to the dashboard. The middleware.ts will now find this cookie instantly.
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.redirect(new URL('/login', request.url));
}
