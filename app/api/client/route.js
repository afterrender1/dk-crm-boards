export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Client } from "@/models";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.full_name || !body.email) {
      return NextResponse.json(
        { message: "Full name and email are required" },
        { status: 400 }
      );
    }

    const client = await Client.create(body);

    return NextResponse.json({
      id: client.client_id,
      message: "Client data added successfully!",
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await Client.findAll({
      order: [["client_id", "DESC"]],
    });

    return NextResponse.json(clients);

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}