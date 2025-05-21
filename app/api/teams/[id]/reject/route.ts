import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { UserSession } from "@/lib/auth-types";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as UserSession;

    if (user.role !== "organizer") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const client = await db;
    const team = await client.db().collection("teams").findOne({
      _id: new ObjectId(params.id),
    });

    if (!team) {
      return new NextResponse("Team not found", { status: 404 });
    }

    await client.db().collection("teams").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status: "rejected" } }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TEAM_REJECT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 