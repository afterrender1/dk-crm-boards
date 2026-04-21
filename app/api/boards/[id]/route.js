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



export async function DELETE(req, { params }) {
    try {
        await connectDB();
        
        // 1. URL se Board ki ID pakrein (e.g., /api/boards/5)
        const { id } = await params; 

        // 2. Database mein dhoonden aur khatam karein
        const deleted = await Board.destroy({
            where: { board_id: id }
        });

        // 3. Agar ID ghalat ho ya board na mile
        if (!deleted) {
            return NextResponse.json({ 
                success: false, 
                message: "Bhai, ye Board pehle hi delete ho chuka hai ya mila hi nahi!" 
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Board aur uske andar ka saara data (Lists & Cards) delete ho gaya! 🗑️"
        }, { status: 200 });

    } catch (error) {
        console.error("Delete Board Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}