import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/verify-otp",
  "/welcome",
];

const publicApiPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const ip = req.ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

  // 1. API Rate Limiting (100 req/min)
  if (nextUrl.pathname.startsWith("/api")) {
    const { success, remaining, reset } = rateLimit(ip);
    
    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

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

  // 2. RBAC Enforcement
  const isAdminPath = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin");
  
  if (isAdminPath) {
    const userRole = (req.auth?.user as any)?.role;
    if (userRole !== "ADMIN") {
      // Redirect unauthorized users to /dashboard
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
