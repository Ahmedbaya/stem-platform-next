import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { action, details, userEmail, userName } = await request.json()
    
    const { db } = await connectToDatabase()
    
    // Get IP address from request headers
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"
    
    const activityLog = {
      action,
      details,
      userEmail: userEmail || session?.user?.email || "anonymous",
      userName: userName || session?.user?.name || "Anonymous",
      timestamp: new Date(),
      ipAddress: ip
    }
    
    await db.collection("activity_logs").insertOne(activityLog)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("Error logging activity:", error)
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
} 