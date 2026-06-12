import { NextResponse } from "next/server";

// 👑 1. Changed from GET to POST to match frontend and endpoint contracts
export async function POST(request: Request) {
  try {
    // 👑 2. Capture the JSON payload body ({ topicIds: [...] }) coming from the frontend
    const bodyData = await request.json();

    // Grab token from incoming client request headers
    const authHeader = request.headers.get('Authorization'); 
    
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/sub-topics/multi-topics`;
    console.log("🚀 Proxying batch multi-topics subtopic fetch downstream to:", backendUrl);

    // 👑 3. Forward the POST request along with the payload data body
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), // Forwards token securely
      },
      body: JSON.stringify(bodyData), // Pass down the topicIds array matrix
    });

    const data = await backendResponse.json();

    // Forward backend response rejections safely
    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // Success! Return payload array data to frontend state hooks
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ Multi-topics Proxy Route Failed:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Proxy Server Error' }, 
      { status: 500 }
    );
  }
}