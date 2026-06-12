import { NextRequest, NextResponse } from "next/server";

// 👑 Define the Next.js 16 dynamic routing context interface
interface RouteContext {
  params: Promise<{
    subjectId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 👑 THE FIX: Await the context params Promise block before destructuring
    const { subjectId } = await context.params;

    if (!subjectId) {
      return NextResponse.json(
        { message: "Missing subjectId path variable parameter segment" },
        { status: 400 }
      );
    }

    // 1. Hit your actual external backend server
    const authHeader = request.headers.get('Authorization'); // Get token from incoming request
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/topics/subject/${subjectId}`;
    
    console.log(`🚀 Proxying topics fetch request downstream to: ${backendUrl}`);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), // Forwards token if it exists
      },
    });

    const data = await backendResponse.json();
    console.log("Received topics response from backend", data);

    // 2. If the real backend rejects the call, forward that error to your frontend
    if (!backendResponse.ok) {
      return NextResponse.json(
        { data: data.data || data },
        { status: backendResponse.status }
      );
    }

    // 3. Success! Return the data back to your Next.js frontend
    return NextResponse.json({
      data: data.data || data
    }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch topics error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}