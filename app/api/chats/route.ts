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
    const type = searchParams.get("type") || "all" // all, direct, group
    const limit = parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before")

    const client = await clientPromise
    const db = client.db()

    let query: any = {
      $or: [
        { "participants.email": session.user.email },
        { "createdBy": session.user.email }
      ]
    }

    if (type !== "all") {
      query.type = type
    }

    if (before) {
      query.updatedAt = { $lt: new Date(before) }
    }

    const chats = await db.collection("chats")
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray()

    // Format chats to handle ObjectIds
    const formattedChats = chats.map(chat => ({
      ...chat,
      _id: chat._id.toString(),
      participants: chat.participants.map((p: any) => ({
        ...p,
        _id: p._id.toString()
      })),
      lastMessage: chat.lastMessage ? {
        ...chat.lastMessage,
        sender: {
          ...chat.lastMessage.sender,
          _id: chat.lastMessage.sender._id.toString()
        }
      } : null
    }))

    return NextResponse.json(formattedChats)

  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { error: "Failed to fetch chats" },
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
    const { type, name, participantEmails } = body

    if (!type || !["direct", "group"].includes(type)) {
      return NextResponse.json({ error: "Invalid chat type" }, { status: 400 })
    }

    if (type === "group" && (!name || !participantEmails?.length)) {
      return NextResponse.json({ error: "Group name and participants are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get creator's user info
    const creator = await db.collection("users").findOne({ email: session.user.email })
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    let participants = [{
      _id: creator._id,
      name: creator.name,
      email: creator.email,
      role: creator.role,
      image: creator.image
    }]

    if (type === "group") {
      // Get all participants' info
      const participantUsers = await db.collection("users")
        .find({ email: { $in: participantEmails } })
        .toArray()

      if (participantUsers.length !== participantEmails.length) {
        return NextResponse.json({ error: "Some participants not found" }, { status: 404 })
      }

      participants = [
        ...participants,
        ...participantUsers.map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image
        }))
      ]
    } else if (type === "direct" && participantEmails?.length === 1) {
      // Get direct chat participant's info
      const participant = await db.collection("users").findOne({ email: participantEmails[0] })
      if (!participant) {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 })
      }

      participants.push({
        _id: participant._id,
        name: participant.name,
        email: participant.email,
        role: participant.role,
        image: participant.image
      })
    } else {
      return NextResponse.json({ error: "Direct chat requires exactly one participant" }, { status: 400 })
    }

    // Create chat
    const chat = await db.collection("chats").insertOne({
      type,
      name: type === "group" ? name : null,
      participants,
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      _id: chat.insertedId.toString(),
      type,
      name: type === "group" ? name : null,
      participants,
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    })

  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
} 