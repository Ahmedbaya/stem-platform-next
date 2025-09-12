import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    console.log("Connected to database")
    
    // First check if submissions collection exists and has any documents
    const submissionsCount = await db.collection("submissions").countDocuments({
      participantEmail: session.user.email
    })
    console.log("Found submissions count:", submissionsCount)

    // Get all submissions for the current user
    const pipeline = [
      {
        $match: {
          participantEmail: session.user.email
        }
      },
      {
        $lookup: {
          from: "competitions",
          let: { competitionId: "$competitionId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$competitionId" }]
                }
              }
            }
          ],
          as: "competition"
        }
      },
      {
        $unwind: {
          path: "$competition",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          id: { $toString: "$_id" },
          competitionId: 1,
          competitionName: { $ifNull: ["$competition.name", "Unknown Competition"] },
          submittedAt: { $ifNull: ["$createdAt", new Date()] },
          status: { $ifNull: ["$status", "pending"] },
          score: 1,
          feedback: 1,
          files: { $ifNull: ["$files", []] }
        }
      },
      {
        $sort: { submittedAt: -1 }
      }
    ]

    console.log("Executing aggregation pipeline")
    const submissions = await db.collection("submissions")
      .aggregate(pipeline)
      .toArray()

    console.log("Pipeline results:", {
      count: submissions.length,
      firstSubmission: submissions[0] ? {
        id: submissions[0].id,
        competitionName: submissions[0].competitionName,
        status: submissions[0].status
      } : null
    })

    return NextResponse.json(submissions)

  } catch (error: any) {
    console.error("Detailed error in submissions API:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: "Failed to fetch submissions", 
        details: error?.message || "Unknown error occurred",
        name: error.name
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { competitionId, files } = await request.json()

    if (!competitionId || !files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Verify the competition exists and is open
    const competition = await db.collection("competitions").findOne({
      _id: new ObjectId(competitionId),
      status: "active"
    })

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found or not active" },
        { status: 404 }
      )
    }

    // Create the submission
    const submission = {
      competitionId: new ObjectId(competitionId),
      participantEmail: session.user.email,
      status: "pending",
      files: files.map(file => ({
        name: file.name,
        url: file.url
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("submissions").insertOne(submission)

    if (!result.acknowledged) {
      throw new Error("Failed to create submission")
    }

    // Return the created submission
    return NextResponse.json({
      id: result.insertedId,
      ...submission,
      competitionId: competitionId // Convert back to string for response
    })

  } catch (error: any) {
    console.error("Error creating submission:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: "Failed to create submission",
        details: error?.message || "Unknown error occurred"
      },
      { status: 500 }
    )
  }
} 