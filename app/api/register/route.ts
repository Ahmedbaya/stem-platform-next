import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import clientPromise from "@/lib/db";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["participant", "organizer", "judge", "spectator"]),
});

export async function POST(req: Request) {
  try {
    console.log("📨 Received request to /api/register");

    const json = await req.json();
    console.log("📩 Request body:", json);

    const body = userSchema.parse(json);
    console.log("✅ Validated body:", body);

    const client = await clientPromise;
    console.log("✅ Connected to MongoDB:", client.db().databaseName);

    const users = client.db().collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email: body.email });
    if (existingUser) {
      console.log("⚠️ User already exists:", existingUser.email);
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(body.password, 12);
    console.log("🔑 Password hashed successfully");

    // Set status for organizer role
    const status = body.role === "organizer" ? "pending" : "approved";
    
    const user = await users.insertOne({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ User registered successfully:", user.insertedId);

    // For organizers, return a different message
    if (body.role === "organizer") {
      return NextResponse.json(
        {
          user: {
            id: user.insertedId.toString(),
            name: body.name,
            email: body.email,
            role: body.role,
            status: "pending",
          },
          message: "Your organizer account is pending approval. You will be notified when an admin approves your account.",
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.insertedId.toString(),
          name: body.name,
          email: body.email,
          role: body.role,
          status: "approved",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Error in register API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
