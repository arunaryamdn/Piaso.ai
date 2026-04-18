import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname.startsWith("/_next")) return NextResponse.next();

  const isAuthPage = pathname === "/login";
  const isLanding = pathname === "/";
  const isZerodhaCallback = pathname === "/zerodha/callback";

  if (isLanding && isLoggedIn) return NextResponse.redirect(new URL("/pulse", req.url));
  if (isAuthPage && isLoggedIn) return NextResponse.redirect(new URL("/pulse", req.url));
  if (!isLoggedIn && !isAuthPage && !isLanding && !isZerodhaCallback)
    return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|coin-jar.svg).*)"],
};
