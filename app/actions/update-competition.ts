"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

export async function updateCompetitionStatus(competitionId: string, status: "draft" | "published" | "ongoing" | "completed") {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" }
    }

    const client = await clientPromise
    const db = client.db()

    // Update competition status
    const result = await db.collection("competitions").updateOne(
      { _id: new ObjectId(competitionId) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          ...(status === "published" ? { publishedAt: new Date() } : {})
        } 
      }
    )

    if (!result.matchedCount) {
      return { success: false, error: "Competition not found" }
    }

    if (!result.modifiedCount) {
      return { success: false, error: "Failed to update competition" }
    }

    // Revalidate the competitions pages
    revalidatePath("/")
    revalidatePath("/competitions")
    revalidatePath("/dashboard/competitions")
    revalidatePath(`/competitions/${competitionId}`)

    return { success: true }
  } catch (error) {
    console.error("[UPDATE_COMPETITION_STATUS]", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update competition status" 
    }
  }
} 