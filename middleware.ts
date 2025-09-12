import { withAuth } from "next-auth/middleware"
import { NextFetchEvent, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: any, event: NextFetchEvent) {
  const token = await getToken({ req })
  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return null
  }

  // Use withAuth for protected routes
  const authMiddleware = await withAuth({
    pages: {
      signIn: "/login",
    },
  })

  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/dashboard/:path*",
    "/competitions/create",
    "/teams/create",
    "/profile/:path*",
    "/settings/:path*",
    // Auth pages that should redirect if user is authenticated
    "/login",
    "/register",
  ],
}

