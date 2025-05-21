import type { NextAuthOptions, User, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/db"
import { compare } from "bcrypt"
import { connectToDatabase } from "@/lib/mongodb"

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      status?: string
    }
  }
  interface User {
    role?: string
    status?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    status?: string
  }
}

interface ActivityUser {
  email?: string | null
  name?: string | null
}

async function logActivity(action: string, details: string, user?: ActivityUser) {
  try {
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        details,
        userEmail: user?.email || undefined,
        userName: user?.name || undefined
      })
    })
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role || "participant", // Default role for Google sign-ins
          status: "approved", // Google users are auto-approved
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const client = await clientPromise
        const users = client.db().collection("users")
        const user = await users.findOne({ email: credentials.email })

        if (!user || !user.password) {
          return null
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        // Check if organizer is approved
        if (user.role === "organizer" && user.status !== "approved") {
          throw new Error("Your organizer account is pending approval. Please wait for admin approval before logging in.")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "participant",
          status: user.status || "approved",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.role) {
        token.role = session.role
        token.status = session.status
      }

      if (user) {
        token.role = user.role
        token.status = user.status
      } else {
        try {
          const client = await clientPromise
          const dbUser = await client
            .db()
            .collection("users")
            .findOne({ email: token.email })
          
          if (dbUser) {
            token.role = dbUser.role
            token.status = dbUser.status
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      }
      
      return token
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.role = token.role
        session.user.status = token.status
      }
      return session
    },
    async signIn({ user }) {
      const { db } = await connectToDatabase()
      
      // Check if user exists
      const dbUser = await db.collection("users").findOne({ email: user.email })
      
      if (!dbUser) {
        await logActivity("login_failed", "User not found", user)
        return false
      }

      // Check if organizer is approved
      if (dbUser.role === "organizer" && dbUser.status !== "approved") {
        await logActivity("login_failed", "Organizer account not approved", user)
        return false
      }

      await logActivity("login_success", "User logged in successfully", user)
      return true
    }
  },
}
