import { NextResponse } from "next/server";

// ==========================================
// 1. PUT HANDLER - Updates test configurations or pushes status live
// ==========================================
export async function PUT(
  request: Request,
  // 👑 FIXED: Added Promise type mapping wrapper matching Next.js App Router rules
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 👑 FIXED: Safely unwrapping the route parameters asynchronously
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const bodyData = await request.json();
    const authHeader = request.headers.get('Authorization'); 
    
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/tests/${id}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), 
      },
      body: JSON.stringify(bodyData),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ Test Update Proxy Route Failed:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// ==========================================
// 2. GET HANDLER - Fetches single test metadata configurations by ID
// ==========================================
export async function GET(
  request: Request,
  // 👑 FIXED: Fully unified type definitions tracking asynchronous promises
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id; 
    
    const authHeader = request.headers.get('Authorization'); 
    
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/tests/${id}`;
    console.log(`🚀 Proxying test profile fetch for ID [${id}] to:`, backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      }
    });

    const data = await backendResponse.json();
    console.log("Received test profile response from backend", data);

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("❌ Test Retrieval Dynamic Proxy Route Failed:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}