import { Server } from "socket.io";
import { Message, User } from "@/models";
import { connectDB } from "@/config/sequelize";

export default function SocketHandler(req, res) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server, {
        path: "/api/socket",
        addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
        // Room join karne ka event
        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        // 📩 Message bhejte waqt ye chalega
        socket.on("send_msg", async (data) => {
            try {
                await connectDB();
                
                // 1. Database mein save karo
                const msg = await Message.create({
                    room_id: data.room_id,
                    user_id: data.user_id,
                    text: data.text
                });

                // 2. User info ke saath message wapas nikalo (UI par naam dikhane ke liye)
                const fullMsg = await Message.findByPk(msg.id, {
                    include: [{ model: User, as: 'sender', attributes: ['name'] }]
                });

                // 3. Poore Room mein broadcast kar do
                io.to(data.room_id).emit("receive_msg", fullMsg);
            } catch (err) {
                console.error("❌ Save Error:", err);
            }
        });
    });

    res.end();
}