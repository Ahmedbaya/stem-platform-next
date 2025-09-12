"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

export async function deleteCompetition(competitionId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" }
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("competitions").deleteOne({
      _id: new ObjectId(competitionId),
      organizerId: session.user.email // Ensure user can only delete their own competitions
    })

    if (!result.deletedCount) {
      return { success: false, error: "Failed to delete competition" }
    }

    // Revalidate the competitions pages
    revalidatePath("/")
    revalidatePath("/competitions")
    revalidatePath("/dashboard/competitions")

    return { success: true }
  } catch (error) {
    console.error("[DELETE_COMPETITION]", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete competition" 
    }
  }
} 