import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    // Clear the Next.js managed cookie entirely
    (await cookies()).delete('access_token');

    return NextResponse.json({ success: true, message: "Logged out from Next.js domain." });
}
