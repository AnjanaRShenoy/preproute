import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 👑 1. Extract the payload body from the frontend containing { question_ids: [...] }
    const bodyData = await request.json();

    // 2. Validate that the payload actually has a question_ids parameter array
    if (!bodyData.question_ids || !Array.isArray(bodyData.question_ids)) {
      return NextResponse.json(
        { success: false, message: "Missing or malformed question_ids array in request payload body." },
        { status: 400 }
      );
    }

    // 3. Grab the incoming JWT token from your frontend request headers
    const authHeader = request.headers.get('Authorization'); 
    
    // Core gateway URL configuration targeting your bulk endpoint
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/questions/fetchBulk`;
    console.log(`🚀 Proxying bulk questions fetch downstream for [${bodyData.question_ids.length}] IDs to:`, backendUrl);

    // 👑 4. Forward the POST request along with the authorization headers and bodyData payload
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), // Forwards bearer token securely
      },
      body: JSON.stringify(bodyData),
    });

    const data = await backendResponse.json();

    // If the real backend rejects the query, pass that error state upstream straight to the UI
    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // 5. Success! Return the fully populated question object details down to the frontend state hooks
    return NextResponse.json({ success: true, data: data.data || data }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Questions Bulk Fetch Proxy Route Failed:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error during question data recovery operations' }, 
      { status: 500 }
    );
  }
}