import { NextRequest, NextResponse } from "next/server";

// 👑 Define Next.js 16 strict asynchronous routing types
interface RouteContext {
  params: Promise<{
    selectedTopic: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 👑 Await the params Promise before destructuring to resolve the Vercel build error
    const { selectedTopic } = await context.params;

    if (!selectedTopic) {
      return NextResponse.json(
        { message: "Missing selectedTopic segment parameter" },
        { status: 400 }
      );
    }

    // 1. Hit your actual external backend server
    const authHeader = request.headers.get('Authorization'); 
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/sub-topics/topic/${selectedTopic}`;
    
    console.log(`🚀 Proxying sub-topics request downstream to: ${backendUrl}`);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), 
      },
    });

    const data = await backendResponse.json();

    // 2. If the real backend rejects the call, forward that error to your frontend
    if (!backendResponse.ok) {
      return NextResponse.json(
        { data: data.data || data },
        { status: backendResponse.status }
      );
    }

    // 3. Success! Return the data back to your frontend state hooks
    return NextResponse.json({
      data: data.data || data
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch sub-topics error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}