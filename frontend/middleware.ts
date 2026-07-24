import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";

// Every page that needs you to be logged in at all. This is the server-side
// guard: if there is no session cookie we send you to log in before the page
// even renders, so a logged-out person never lands on a "wrong account" wall.
//
// It only checks that you ARE logged in, not WHICH role you are - the real
// permission check lives on the backend (every API call returns 401/403), and
// the "this page is for admins" message is handled by each page. Those two
// cases are different: "not logged in" is fixed by logging in, so we redirect
// here; "logged in as the wrong role" is not, so the page explains it instead.
const LOGIN_REQUIRED = [
  "/dashboard",
  "/admin",
  "/owner",
  "/account",
  "/my-reviews",
  "/reviews",
  "/verify",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsLogin = LOGIN_REQUIRED.some((path) => pathname.startsWith(path));
  if (!needsLogin) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME);
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // remember where they were headed, so login can send them back
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/owner/:path*",
    "/account/:path*",
    "/my-reviews/:path*",
    "/reviews/:path*",
    "/verify/:path*",
  ],
};
