import { connectDB } from "@/config/sequelize";
import { Board, List, Card } from "@/models/index";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const boardDetail = await Board.findByPk(id, {
            include: [
                {
                    model: List,
                    as: "lists",
                    include: [
                        {
                            model: Card,
                            as: "cards"
                        }
                    ]
                }
            ],
            order: [
                [{ model: List, as: "lists" }, "order_index", "ASC"],
                [{ model: List, as: "lists" }, { model: Card, as: "cards" }, "order_index", "ASC"]
            ]
        });

        if (!boardDetail) {
            return NextResponse.json({ success: false, message: "Board nahi mila!" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            board: boardDetail
        }, { status: 200 });

    } catch (error) {
        console.error("Get Board Detail Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}