"use server"

import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function approveTeam(teamId: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("teams").updateOne(
      { _id: new ObjectId(teamId) },
      { $set: { status: "approved" } }
    )

    if (!result.matchedCount) {
      return { success: false, error: "Team not found" }
    }

    revalidatePath("/dashboard/competitions/[id]/teams")
    return { success: true }
  } catch (error) {
    console.error("Error approving team:", error)
    return { success: false, error: "Failed to approve team" }
  }
}

export async function rejectTeam(teamId: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("teams").updateOne(
      { _id: new ObjectId(teamId) },
      { $set: { status: "rejected" } }
    )

    if (!result.matchedCount) {
      return { success: false, error: "Team not found" }
    }

    revalidatePath("/dashboard/competitions/[id]/teams")
    return { success: true }
  } catch (error) {
    console.error("Error rejecting team:", error)
    return { success: false, error: "Failed to reject team" }
  }
} 