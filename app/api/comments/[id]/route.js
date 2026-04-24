import { NextResponse } from "next/server";
import { Comment } from "@/models";
import { connectDB } from "@/config/sequelize";

export async function DELETE(req, { params }) {

    try {
        await connectDB();
        const { id } = await params;
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return NextResponse.json({
                success: false,
                message: "comment not found",
            }, {
                status: 404
            })
        }
        const deletedComment = await Comment.destroy({
            where: {
                comment_id: id
            }
        })

        return NextResponse.json({
            success: true,
            message: "comment deleted successfully",
            deletedComment,
        }, {
            status: 200
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "comment not deleted , or server error ",
            error
        }, {
            status: 500
        })
    }

}