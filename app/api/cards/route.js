import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { Card } from "@/models";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();
        const { title, description, priority, due_date, order_index, list_id } = data;
        if (!title) {
            return NextResponse.json({
                success: false,
                message: "title not be empty",
            }, { status: 400 })

        }
        const createdCard = await Card.create({
            title,
            description,
            priority: priority || "Medium",
            due_date,
            order_index,
            list_id
        })

        return NextResponse.json({
            success: true,
            message: "Card created successfully",
            card: createdCard
        }, { status: 201 })

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "error while creating card or server error",
            error: error.message
        }, { status: 500 })
    }

}