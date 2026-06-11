import { NextResponse } from "next/server";

// ==========================================
// 1. PUT HANDLER - Updates test configurations or pushes status live
// ==========================================
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } =await params;
    
    // Parse the incoming body modification payload from the UI
    const bodyData = await request.json();

    // Grab the incoming JWT authorization token from client headers
    const authHeader = request.headers.get('Authorization'); 
    
    // Core backend gateway URL configuration endpoint structure targeting test profiles
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/tests/${id}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }), // Forwards token securely
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const authHeader = request.headers.get('Authorization'); 
    
    const backendUrl = `${process.env.PREPROUTE_BACKEND_URL}/tests/${id}`;

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
    console.error("❌ Test Retrieval Dynamic Proxy Route Failed:", error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}