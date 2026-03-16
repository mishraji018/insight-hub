import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
];

const publicApiPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(publicApiPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Allow next-auth API routes and general auth API routes
  if (isApiAuthRoute) return NextResponse.next();

  if (isPublicRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // At this point, everything else requires authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Admin access check for /admin/* paths
  if (nextUrl.pathname.startsWith("/admin")) {
    const userRole = (req.auth?.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/webhook).*)"
  ],
};
