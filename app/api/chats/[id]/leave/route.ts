import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const client = await clientPromise
    const db = client.db()

    // Get the chat
    const chat = await db.collection("chats").findOne({ _id: new ObjectId(id) })
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some((p: any) => p.email === session.user.email)
    if (!isParticipant) {
      return NextResponse.json({ error: "Not a participant in this chat" }, { status: 403 })
    }

    // For direct chats, delete the chat entirely
    if (chat.type === "direct") {
      await db.collection("chats").deleteOne({ _id: new ObjectId(id) })
      // Also delete all messages in this chat
      await db.collection("messages").deleteMany({ chatId: new ObjectId(id) })
    } else {
      // For group chats, remove the user from participants
      await db.collection("chats").updateOne(
        { _id: new ObjectId(id) },
        { 
          $pull: { 
            participants: { email: session.user.email } as any
          }
        }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error leaving chat:", error)
    return NextResponse.json(
      { error: "Failed to leave chat" },
      { status: 500 }
    )
  }
} 