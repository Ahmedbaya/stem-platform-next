import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only admins can update competition status
    if ((session.user as any).role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { status } = await req.json()

    if (!status || !["draft", "published", "ongoing", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Update competition status
    const result = await db.collection("competitions").updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          ...(status === "published" ? { publishedAt: new Date() } : {})
        } 
      }
    )

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }

    if (!result.modifiedCount) {
      return NextResponse.json({ error: "Failed to update competition" }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COMPETITION_STATUS_UPDATE]", error)
    return NextResponse.json({ 
      error: "Internal Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 