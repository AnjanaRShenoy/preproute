// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. If user is logged in, DON'T let them see the login page
  if (pathname === "/login" && token) {
    console.log("User is already logged in, redirecting to home page");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If user is NOT logged in, DON'T let them see protected pages (like home)
  if (pathname === "/" && !token) {
    console.log("User is not authenticated, redirecting to login page");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 3. Make sure the matcher includes BOTH paths so the middleware triggers on them
export const config = {
  matcher: ["/", "/login"],
};