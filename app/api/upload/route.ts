import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Create a unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public/uploads")
    await writeFile(join(uploadDir, file.name), buffer)
    
    // Return the URL for the uploaded file
    return NextResponse.json({ 
      url: `/uploads/${file.name}`,
      name: file.name
    })

  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error.message },
      { status: 500 }
    )
  }
} 