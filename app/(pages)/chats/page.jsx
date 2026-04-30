"use client"
import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useUser } from '@/app/hooks/useUser';
import { Plus, MessageSquare, Users, Clock, User } from 'lucide-react';
import { inter } from '@/app/fonts';

const fetcher = (url) => fetch(url).then((res) => res.json());

const AllChatsPage = () => {
    const { user } = useUser();
    const [isCreating, setIsCreating] = useState(false);

    const { data, error, isLoading, mutate } = useSWR('/api/chat/rooms', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    const handleCreateChat = async () => {
        const roomName = prompt("Enter Chat Room Name:");
        if (!roomName?.trim() || !user) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/chat/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: roomName.trim(), 
                    user_id: user.user_id 
                }),
            });

            const result = await res.json();
            if (result.success) {
                mutate();
                alert("✅ Chat room created successfully!");
            } else {
                alert(result.message || "Failed to create room");
            }
        } catch (err) {
            console.error("Create Room Error:", err);
            alert("Something went wrong.");
        } finally {
            setIsCreating(false);
        }
    };

    if (error) return <div className="p-10 text-red-500 text-center">Failed to load chats.</div>;

    return (
        <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-600 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Chats</h1>
                            <p className="text-sm text-gray-500">All team conversations</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateChat}
                        disabled={isCreating}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl font-medium transition-all disabled:opacity-70"
                    >
                        <Plus size={20} />
                        {isCreating ? "Creating..." : "New Room"}
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* List Header */}
                <div className="grid grid-cols-12 text-sm font-medium text-gray-500 px-4 pb-3 border-b">
                    <div className="col-span-7">ROOM NAME</div>
                    <div className="col-span-3">CREATED BY</div>
                    <div className="col-span-2 text-right">CREATED</div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="space-y-3 mt-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-2 space-y-2">
                        {data?.rooms?.map((room) => (
                            <Link 
                                key={room.room_id} 
                                href={`/chat/${room.room_id}`}
                                className="block group"
                            >
                                <div className="bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-2xl p-5 transition-all flex items-center gap-5 group-hover:shadow-sm">
                                    
                                    {/* Icon */}
                                    <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <MessageSquare size={24} />
                                    </div>

                                    {/* Room Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-semibold text-gray-900 truncate">
                                                {room.name}
                                            </h2>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <Users size={15} className="text-gray-400" />
                                            Team Discussion
                                        </div>
                                    </div>

                                    {/* Created By */}
                                    <div className="col-span-3 hidden md:block w-52">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User size={14} />
                                            </div>
                                            <span className="truncate">
                                                {room.creator?.name || 'System'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Created Date */}
                                    <div className="text-right text-sm text-gray-500 w-28">
                                        {room.created_at 
                                            ? new Date(room.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                              })
                                            : '—'
                                        }
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-gray-300 group-hover:text-purple-600 transition-colors">
                                        →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {data?.rooms?.length === 0 && !isLoading && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed mt-8">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-700">No chat rooms yet</h3>
                        <p className="text-gray-500 mt-2 mb-6">Create your first room to start team conversations</p>
                        <button
                            onClick={handleCreateChat}
                            className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 mx-auto hover:bg-purple-700 transition"
                        >
                            <Plus size={20} />
                            Create New Chat Room
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllChatsPage;