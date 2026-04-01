import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api/auth/"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths, API auth routes
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p))) {
    // Redirect logged-in users away from login
    const token = request.cookies.get("session_token")?.value;
    if (token && path === "/login") {
      return NextResponse.redirect(new URL("/deck", request.url));
    }
    return NextResponse.next();
  }

  // Check for session cookie — redirect unauthenticated users
  const token = request.cookies.get("session_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
