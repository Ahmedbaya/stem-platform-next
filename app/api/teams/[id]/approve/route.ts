import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if ((session.user as any).role !== "organizer") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.id),
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    await db.collection("teams").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status: "approved" } }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TEAM_APPROVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 