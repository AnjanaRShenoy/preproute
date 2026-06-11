import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Read the incoming payload data array sent from your TestBuilder component
    const bodyData = await request.json();

    // 2. Extract the incoming JWT Authorization token string from headers
    const authHeader = request.headers.get('Authorization'); 
    
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/questions/bulk`;

    // 3. Make the actual POST request forwarding the body data downstream
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), // Forwards Bearer token securely
      },
      body: JSON.stringify(bodyData), // Forwards your { questions: [...] } payload intact
    });

    const data = await backendResponse.json();

    // 4. If the backend fails or throws a validation error, forward that downstream
    if (!backendResponse.ok) {
      return NextResponse.json(
        data, 
        { status: backendResponse.status }
      );
    }

    // 5. Success! Forward the array response and confirmation messages back to the client
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ Bulk Question creation proxy error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}