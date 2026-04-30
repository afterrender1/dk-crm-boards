import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  // Agar server pehle se chal raha hai toh naya start nahi karna
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: "/api/socket", // Yeh path client se match hona chahiye
    addTrailingSlash: false,
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Socket Connection Established:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send_msg", (data) => {
      // Message ko us specific room mein bhej dena
      io.to(data.roomId).emit("receive_msg", data);
    });
  });

  res.end();
}