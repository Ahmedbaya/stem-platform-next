import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    // Get user's notifications (both read and unread)
    const notifications = await db.collection("notifications")
      .find({ 
        recipientEmail: session.user.email
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Format notifications to handle ObjectIds
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      _id: notification._id.toString(),
      competitionId: notification.competitionId?.toString(),
      teamId: notification.teamId?.toString()
    }))

    return NextResponse.json(formattedNotifications)

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: "Missing notification ID" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    // Mark notification as read
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId), recipientEmail: session.user.email },
      { $set: { read: true, readAt: new Date() } }
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
} 