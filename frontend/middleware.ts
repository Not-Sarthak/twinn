import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow direct access to the mint page with query parameters
  if (
    path === "/mint" &&
    (request.nextUrl.searchParams.has("mintAddress") ||
      request.nextUrl.searchParams.has("uniqueCode"))
  ) {
    return NextResponse.next();
  }

  const isPublicPath =
    path === "/" ||
    path === "/gallery" ||
    path === "/collections" ||
    path === "/about" ||
    path === "/drop" ||
    path.startsWith("/gallery/") ||
    path.startsWith("/collections/") ||
    path.startsWith("/drop/") ||
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.startsWith("/public/") ||
    path.includes("logo.svg") ||
    path.includes(".png") ||
    path.includes(".jpg") ||
    path.includes(".jpeg") ||
    path.includes(".gif") ||
    path.includes(".mp4") ||
    path.includes(".svg") ||
    path.includes(".ico");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.has("privy-token");

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/og|_next/static|_next/image|favicon.ico|logo.svg|images/|public/).*)",
  ],
};
