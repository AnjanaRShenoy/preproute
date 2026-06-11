import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {

        // 1. Hit your actual external backend server
        const authHeader = request.headers.get('Authorization'); // Get token from incoming request
        const backendResponse = await fetch(`${process.env.PREPROUTE_BACKEND_URL}/subjects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), // Forwards token if it exists
      },

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
            data
        }, { status: 200 });
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}