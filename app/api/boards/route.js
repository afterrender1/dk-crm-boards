import Board from "@/models/Board";
import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";


export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, bg_color, description } = body;
        if (!name) {
            return NextResponse.json({ Message: "name is required" }, { status: 400 })
        }

        const newBoard = await Board.create({
            name,
            bg_color: bg_color || "#57C9D8",
            description
        });

        return NextResponse.json({
            success: true,
            message: "Board created successfully",
            board: newBoard
        }, { status: 201 });

    } catch (error) {
        console.error("Post board error", error);
        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        })
    }
}


export async function GET() {
    try {
        await connectDB();
        const allBoards = await Board.findAll({
            order: [["created_at", "DESC"]]
        });

        return NextResponse.json({
            success: true,
            message: 'All boards are below',
            count: allBoards.length,
            boards: allBoards
        }, { status: 200 })

    } catch (error) {
        console.error(error);
        return NextResponse.json({

            success: false,
            message: "Error getting boards or server error",
        }, {
            status: 500
        })
    }
}
