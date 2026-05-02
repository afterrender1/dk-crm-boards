"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/app/hooks/useSocket';
import { useUser } from '@/app/hooks/useUser';
import { Send, MoreVertical } from 'lucide-react';
import { inter } from '@/app/fonts';

const ChatPage = () => {
    const { id: roomId } = useParams();
    const { user } = useUser();
    const socket = useSocket();
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    // Fetch chat history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat/history?room_id=${roomId}`);
                const data = await res.json();
                if (data.success) setMessages(data.history || []);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        if (roomId) fetchHistory();
    }, [roomId]);

    // Real-time messages
    useEffect(() => {
        if (!socket || !roomId) return;

        socket.emit("join_room", roomId);

        socket.on("receive_msg", (newMsg) => {
            setMessages((prev) => [...prev, newMsg]);
        });

        return () => socket.off("receive_msg");
    }, [socket, roomId]);

    // Auto scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !user) return;

        const messageData = {
            room_id: roomId,
            user_id: user.user_id,
            sender: { name: user.name || "You" },
            text: input.trim(),
            created_at: new Date().toISOString(),
        };

        socket.emit("send_msg", messageData);
        setInput("");
    };

    return (
        <div className={`flex flex-col h-screen bg-[#f8f9fa] items-center justify-center ${inter.className}`}>
            {/* Centered Chat Container - Max Width 400px */}
            <div className="w-full max-w-350 h-screen flex flex-col bg-white  overflow-hidden ">
                
                {/* Chat Header */}
                <div className="bg-white border-b px-4 py-4 flex items-center justify-between ">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <div>
                            <h2 className="font-semibold text-[17px] text-gray-900">Weavesocial Team</h2>
                            <p className="text-xs text-green-600 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                8 online
                            </p>
                        </div>
                    </div>

                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8f9fa] custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <div>
                                <p className="text-gray-400 text-sm">No messages yet</p>
                                <p className="text-gray-300 text-xs mt-1">Start the conversation!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isOwnMessage = msg.user_id === user?.user_id;

                            return (
                                <div 
                                    key={index} 
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                                >
                                    {!isOwnMessage && (
                                        <div className="w-7 h-7 rounded-full overflow-hidden mr-2.5 flex-shrink-0 mt-0.5">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_id}`} 
                                                alt="avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                        {!isOwnMessage && (
                                            <div className="text-[11px] text-gray-500 mb-1 ml-1 font-medium">
                                                {msg.sender?.name || 'Team Member'}
                                            </div>
                                        )}

                                        <div 
                                            className={`px-4 py-2.5 rounded-3xl text-[15px] leading-relaxed break-words ${
                                                isOwnMessage 
                                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                                    : 'bg-white border border-gray-100 shadow-sm rounded-bl-none'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>

                                        <div className="text-[10px] text-gray-400 mt-1 px-1">
                                            {msg.createdAt 
                                                ? new Date(msg.createdAt).toLocaleTimeString([], { 
                                                    hour: 'numeric', 
                                                    minute: '2-digit' 
                                                  }) 
                                                : 'Just now'
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t p-4">
                    <form onSubmit={handleSend}>
                        <div className="relative flex items-center bg-gray-100 rounded-3xl px-5 py-1 border focus-within:border-blue-400 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent outline-none text-[15px] placeholder-gray-500 py-3 px-3"
                            />
                            
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-2xl transition-all ml-1"
                            >
                                <Send size={20} />
                            </button>

                          
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;