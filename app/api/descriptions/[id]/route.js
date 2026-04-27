import { NextResponse } from "next/server";
import { connectDB } from "@/config/sequelize";
import { Description } from "@/models";


export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const description = await Description.findByPk(id);

        if (!description) {
            return NextResponse.json({
                success: false,
                message: "description not found ❌"
            }, { status: 404 })
        }

        const deletedDescription = await Description.destroy({
            where: { description_id: description.description_id }
        })
        return NextResponse.json({
            success: true,
            message: "descriptions deleted succesfully",
            deletedDescription: deletedDescription
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "descriptions not deleted or server error!",
        }, { status: 500 })
    }

}

