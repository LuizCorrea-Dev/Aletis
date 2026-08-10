import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/feed",
  "/profile",
  "/atrio",
  "/connections",
  "/communities",
  "/chat",
  "/invite",
];

const AUTH_ONLY_PATHS = ["/login", "/register", "/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("aletis_session")?.value;
  const hasSession = !!sessionCookie && sessionCookie.length > 10;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
