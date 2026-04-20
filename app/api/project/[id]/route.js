export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Project } from "@/models";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [updated] = await Project.update(body, {
      where: { project_id: id },
    });

    if (!updated) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully" });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const data = await req.json();

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ message: "No data provided" }, { status: 400 });
        }

        const [affectedRows] = await Project.update(data, {
            where: { project_id: id },
        });

        if (affectedRows === 0) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Data updated successfully", affectedRows });

    } catch (error) {
        return NextResponse.json({ message: "Error while updating project", error: error.message }, { status: 500 });
    }
}