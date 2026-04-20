export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Project, Client } from "@/models";

export async function POST(req) {
    try {
        const data = await req.json();
        const project = await Project.create(data);

        return NextResponse.json(project, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const projects = await Project.findAll({
            include: {
                model: Client,
                attributes: ["full_name", "email", "company_name"],
            },
            order: [["created_at", "DESC"]],
        });

        return NextResponse.json({ projects, message: "Projects retrieved successfully" });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}