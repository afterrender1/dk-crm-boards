import { NextResponse } from "next/server";
import Comment from "@/models/Comment";
import Card from "@/models/Card"; // Card model bhi import karein
import { connectDB } from "@/config/sequelize";

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        const numericCardId = parseInt(id);

        // Fetch comments for this card, ordered by most recent first
        const comments = await Comment.findAll({
            where: { card_id: numericCardId },
            order: [['createdAt', 'DESC']]
        });

        return NextResponse.json({
            success: true,
            comments
        });

    } catch (error) {
        console.error("Comment GET Error:", error.message);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch comments"
        }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        await connectDB(); // Connection lazmi check karein

        const { id } = await params;
        const numericCardId = parseInt(id); // ID ko number mein convert karein
        const data = await req.json();
        const { text } = data;

        if (!text) {
            return NextResponse.json({ success: false, message: "Comment cannot be empty" }, { status: 400 });
        }

        // 1. Check karein ke Card exist karta hai?
        const cardExists = await Card.findByPk(numericCardId);

        if (!cardExists) {
            return NextResponse.json({
                success: false,
                message: `Card with ID ${numericCardId} does not exist. Parent missing!`
            }, { status: 404 });
        }

        // 2. Agar card hai, toh comment create karein
        const newComment = await Comment.create({
            text,
            card_id: numericCardId
        });

        return NextResponse.json({
            success: true,
            message: "Comment added successfully! 💬",
            newComment
        });

    } catch (error) {
        console.error("Comment API Error:", error.message);
        return NextResponse.json({
            success: false,
            error: "Database constraint error. Make sure the Card ID is valid."
        }, { status: 500 });
    }
}