import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming form payload from your CreateTest component
    const bodyData = await request.json();

    // 2. Extract the incoming JWT authorization token from request headers
    const authHeader = request.headers.get('Authorization'); 
    
    // Ensure you have PREPROUTE_BACKEND_URL set up in your .env file
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/tests`;

    // 3. Forward the POST request payload downstream to the main server backend
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forwards Bearer token securely to satisfy backend auth requirements
        ...(authHeader && { 'Authorization': authHeader }), 
      },
      body: JSON.stringify(bodyData), 
    });

    const data = await backendResponse.json();

    // 4. If the real backend rejects the call (validation error, etc.), forward that error to frontend
    if (!backendResponse.ok) {
      return NextResponse.json(
        data, 
        { status: backendResponse.status }
      );
    }

    // 5. Success! Return the initialized test profile (including its new generated ID) back to the UI
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ Test Creation Proxy Error:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization'); 
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/tests`;

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      }
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ Test Retrieval Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}