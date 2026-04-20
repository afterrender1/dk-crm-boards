export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ClientNote } from "@/models";

export async function POST(req, { params }) {
  try {
    const {id} = await params;
    const { note } = await req.json();

    if (!note) {
      return NextResponse.json({ message: "Note is required" }, { status: 400 });
    }

    const newNote = await ClientNote.create({
      client_id: id,
      note,
    });

    return NextResponse.json(newNote, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}