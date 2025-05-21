import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

// Define available permissions
export const PERMISSIONS = {
  admin: [
    "user_management",
    "competition_management",
    "security_settings",
    "system_configuration",
  ],
  organizer: [
    "create_competitions",
    "manage_teams",
    "view_reports",
    "update_schedules",
  ],
  participant: [
    "join_competitions",
    "view_schedules",
    "submit_entries",
  ],
  judge: [
    "evaluate_entries",
    "view_submissions",
    "provide_feedback",
  ]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Get roles collection or create default roles if it doesn't exist
    const rolesCollection = db.collection("roles")
    const existingRoles = await rolesCollection.find({}).toArray()

    if (existingRoles.length === 0) {
      // Initialize default roles
      await rolesCollection.insertMany([
        {
          name: "admin",
          displayName: "Admin",
          description: "Full system access and management capabilities",
          permissions: PERMISSIONS.admin,
          isSystem: true
        },
        {
          name: "organizer",
          displayName: "Organizer",
          description: "Competition management and team oversight",
          permissions: PERMISSIONS.organizer,
          isSystem: true
        },
        {
          name: "participant",
          displayName: "Participant",
          description: "Basic competition participation access",
          permissions: PERMISSIONS.participant,
          isSystem: true
        },
        {
          name: "judge",
          displayName: "Judge",
          description: "Competition judging and evaluation capabilities",
          permissions: PERMISSIONS.judge,
          isSystem: true
        }
      ])
      return NextResponse.json(await rolesCollection.find({}).toArray())
    }

    return NextResponse.json(existingRoles)

  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roleName, permissions } = await request.json()
    const { db } = await connectToDatabase()
    
    // Update role permissions
    const result = await db.collection("roles").updateOne(
      { name: roleName },
      { $set: { permissions } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    )
  }
} 