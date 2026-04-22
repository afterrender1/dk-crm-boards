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





export async function DELETE(req, { params }) {
    try {
        await connectDB();
        
        // URL se List ki ID pakrein
        const { id } = await params; 

        // Database se list ko udaa dein
        const deletedCount = await List.destroy({
            where: { list_id: id }
        });

        // Check karein ke kya list waqai thi ya pehle hi delete ho chuki hai
        if (deletedCount === 0) {
            return NextResponse.json({
                success: false,
                message: "List nahi mili ya pehle hi delete ho chuki hai."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "List (aur uske cards) kamyabi se delete ho gaye! 🗑️"
        });

    } catch (error) {
        console.error("Error while deleting list:", error.message);
        return NextResponse.json({
            success: false,
            message: "List delete karne mein masla hua",
            error: error.message
        }, { status: 500 });
    }
}