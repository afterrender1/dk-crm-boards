import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import Description from "@/models/Description";
import { Card } from "@/models";

export async function POST(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const numericCardId = parseInt(id);

        const { text } = await req.json();

        if (!text?.trim()) {
            return NextResponse.json({
                success: false,
                message: "Description text is required",
            }, { status: 400 });
        }

        const card = await Card.findByPk(numericCardId);
        if (!card) {
            return NextResponse.json({
                success: false,
                message: "Card nahi mila",
            }, { status: 404 });
        }

        const newDescription = await Description.create({
            text,
            card_id: numericCardId
        });

        return NextResponse.json({
            success: true,
            message: "Description created successfully! ✨",
            createdDescription: newDescription
        }, { status: 201 });

    } catch (error) {
        console.error("Description API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        }, { status: 500 });
    }
}