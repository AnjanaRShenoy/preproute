import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const { userId, password } = await request.json();
    try {

        if (!userId || !password) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }
        // 1. Hit your actual external backend server
        console.log("Forwarding login request to backend", process.env.PREPROUTE_BACKEND_URL);
        const backendResponse = await fetch(`${process.env.PREPROUTE_BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, password }), 
        });

        const data = await backendResponse.json();

        // 2. If the real backend rejects the login, forward that error to your frontend
        if (!backendResponse.ok) {
            return NextResponse.json(
                { message: data.message || 'Invalid credentials' },
                { status: backendResponse.status }
            );
        }

        // 3. Success! Return the user data / token back to your Next.js frontend
        return NextResponse.json({
            success: true,
            user: data.user,
            token: data.data.token
        }, { status: 200 });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}