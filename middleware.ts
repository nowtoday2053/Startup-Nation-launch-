import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow access to onboarding page for authenticated users
    if (req.nextUrl.pathname === "/onboarding") {
      return NextResponse.next()
    }
    
    // For other protected routes, client-side onboarding check will handle redirects
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public pages
        if (req.nextUrl.pathname.startsWith("/login") ||
            req.nextUrl.pathname.startsWith("/register") ||
            req.nextUrl.pathname === "/" ||
            req.nextUrl.pathname.startsWith("/api/auth")) {
          return true
        }
        
        // Allow onboarding page for authenticated users
        if (req.nextUrl.pathname === "/onboarding") {
          return !!token
        }
        
        // Require authentication for all other protected routes
        if (req.nextUrl.pathname.startsWith("/feed") ||
            req.nextUrl.pathname.startsWith("/explore") ||
            req.nextUrl.pathname.startsWith("/chat") ||
            req.nextUrl.pathname.startsWith("/submit") ||
            req.nextUrl.pathname.startsWith("/profile")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/feed/:path*", "/dashboard/:path*", "/onboarding", "/submit", "/explore", "/chat", "/profile/:path*"]
} 