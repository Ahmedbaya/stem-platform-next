import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Get pending organizers count
    const pendingOrganizers = await db.collection("users").countDocuments({
      role: "organizer",
      status: "pending"
    })

    // Get active organizers count
    const activeOrganizers = await db.collection("users").countDocuments({
      role: "organizer",
      status: "approved"
    })

    // Get failed login attempts in last 24 hours
    const failedLogins = await db.collection("activity_logs").countDocuments({
      action: "login_failed",
      timestamp: { $gte: twentyFourHoursAgo }
    })

    // Get active sessions - updated query
    const activeSessions = await db.collection("sessions").aggregate([
      {
        $match: {
          expires: { $gt: now }
        }
      },
      {
        $group: {
          _id: "$userId",
          latestSession: { $max: "$expires" }
        }
      },
      {
        $count: "total"
      }
    ]).toArray()

    // Get recent activity logs
    const recentLogs = await db.collection("activity_logs")
      .find({
        timestamp: { $gte: twentyFourHoursAgo }
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({
      pendingOrganizers,
      activeOrganizers,
      failedLogins,
      activeSessions: activeSessions[0]?.total || 0,
      recentLogs
    })

  } catch (error) {
    console.error("Error fetching security stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch security statistics" },
      { status: 500 }
    )
  }
} 