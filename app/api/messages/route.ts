import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get("chatId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before")

    const client = await clientPromise
    const db = client.db()

    // Get user's chats
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let query: any = {}
    
    if (chatId) {
      // Get messages for a specific chat
      query.chatId = new ObjectId(chatId)
    } else {
      // Get all chats the user is part of
      query.$or = [
        { "participants.email": session.user.email },
        { "createdBy": session.user.email }
      ]
    }

    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const messages = await db.collection("messages")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    // Format messages to handle ObjectIds
    const formattedMessages = messages.map(message => ({
      ...message,
      _id: message._id.toString(),
      chatId: message.chatId?.toString(),
      sender: {
        ...message.sender,
        _id: message.sender._id.toString()
      }
    }))

    return NextResponse.json(formattedMessages)

  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { content, chatId, recipientEmail } = body

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get sender's user info
    const sender = await db.collection("users").findOne({ email: session.user.email })
    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    let messageData: any = {
      content,
      sender: {
        _id: sender._id,
        name: sender.name,
        email: sender.email,
        role: sender.role,
        image: sender.image
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (chatId) {
      // Add to existing chat
      messageData.chatId = new ObjectId(chatId)
    } else if (recipientEmail) {
      // Create new chat
      const recipient = await db.collection("users").findOne({ email: recipientEmail })
      if (!recipient) {
        return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
      }

      // Create new chat
      const chat = await db.collection("chats").insertOne({
        type: "direct",
        participants: [
          {
            _id: sender._id,
            name: sender.name,
            email: sender.email,
            role: sender.role,
            image: sender.image
          },
          {
            _id: recipient._id,
            name: recipient.name,
            email: recipient.email,
            role: recipient.role,
            image: recipient.image
          }
        ],
        createdBy: session.user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      messageData.chatId = chat.insertedId
    } else {
      return NextResponse.json({ error: "Either chatId or recipientEmail is required" }, { status: 400 })
    }

    // Insert message
    const message = await db.collection("messages").insertOne(messageData)

    // Update chat's lastMessage
    await db.collection("chats").updateOne(
      { _id: messageData.chatId },
      {
        $set: {
          lastMessage: {
            content,
            sender: messageData.sender,
            createdAt: messageData.createdAt
          },
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      ...messageData,
      _id: message.insertedId.toString(),
      chatId: messageData.chatId.toString()
    })

  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
} 