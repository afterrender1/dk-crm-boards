import { connectDB } from "@/config/sequelize";
import List from "@/models/List";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const data = await req.json();
        const { id } = await params;
        const { name, index_order } = data;

        if (!name) {
            return NextResponse.json({
                success: true,
                message: "Name is required",
            }, { status: 400 })
        }

        const createdList = await List.create({
            name,
            index_order: index_order || 1,
            board_id: id
        })
        return NextResponse.json({
            success: true,
            message: "List Created Successfully",
            createdList
        })
    } catch (error) {
        console.error("error white creating list", error.message);
        return NextResponse.json({
            success: false,
            message: "error while creating list",
            error: error.message
        })
    }
}


