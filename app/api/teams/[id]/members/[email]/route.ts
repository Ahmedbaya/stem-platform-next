import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; email: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the team
    const team = await db
      .collection("teams")
      .findOne({ _id: new ObjectId(params.id) })

    if (!team) {
      return new NextResponse("Team not found", { status: 404 })
    }

    // Only team leader can remove members
    if (team.leader !== session.user.email) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Cannot remove team leader
    if (params.email === team.leader) {
      return new NextResponse("Cannot remove team leader", { status: 400 })
    }

    // Check if member exists in team
    if (!team.members.includes(params.email)) {
      return new NextResponse("Member not found in team", { status: 404 })
    }

    // Remove member from team
    await db
      .collection("teams")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $pull: { members: params.email } } as any
      )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEAM_MEMBER_REMOVE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 