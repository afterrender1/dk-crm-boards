"use client"
import React, { useState, useEffect } from 'react';
import { useSocket } from '@/app/hooks/useSocket';
import { useUser } from '@/app/hooks/useUser';
import { inter } from '@/app/fonts';

const ChatPage = () => {
    const { user } = useUser(); // Aapka purana user hook
    const socket = useSocket();
    const [activeRoom, setActiveRoom] = useState('general');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        if (!socket) return;

        // Room Join karna
        socket.emit("join_room", activeRoom);

        // Messages receive karna
        socket.on("receive_msg", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => socket.off("receive_msg");
    }, [socket, activeRoom]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !user) return;

        const payload = {
            roomId: activeRoom,
            sender: user.name,
            text: input,
        };

        socket.emit("send_msg", payload);
        setInput("");
    };

    return (
        <div className={`p-10 lg:ml-20 ${inter.className}`}>
            <h1 className="text-2xl font-bold mb-4">Agency Chat (# {activeRoom})</h1>
            <div className="h-96 border rounded-xl p-4 overflow-y-auto bg-white mb-4">
                {messages.map((m, i) => (
                    <div key={i} className={`mb-2 ${m.sender === user?.name ? 'text-right' : 'text-left'}`}>
                        <span className="text-[10px] block font-bold text-purple-600">{m.sender}</span>
                        <span className="bg-gray-100 p-2 rounded-lg inline-block text-sm">{m.text}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    className="border p-2 flex-1 rounded-lg" 
                    placeholder="Type message..." 
                />
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg">Send</button>
            </form>
        </div>
    );
};

export default ChatPage;