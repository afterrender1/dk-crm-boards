export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";

export async function GET() {
  await connectDB();

  return NextResponse.json({
    message: "DB check done (see terminal)",
  });
}