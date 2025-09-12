import { withAuth } from "next-auth/middleware"
import { NextFetchEvent, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
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
  return withAuth({
    pages: {
      signIn: "/login",
    },
  })(req as any, event)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/competitions/create",
    "/teams/create",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
} 