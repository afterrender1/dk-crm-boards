"use client"

import React, { useState, useCallback } from 'react'
import { useParams } from "next/navigation";
import useSWR from 'swr';
import { urbanist } from "@/app/fonts";
import BoardContainer from "@/app/component/boards-component/BoardContainer";
import CommentSidebar from '@/app/component/boards-component/CommentSidebar';

// 1. Fetcher function: SWR ka worker jo API se data layega
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BoardPage() {
    const params = useParams();
    const id = params?.id;

    // Sidebar states: Track karne ke liye ke kaunsa card khula hai
    const [selectedCard, setSelectedCard] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 2. SWR Hook: Board ka sara data fetch aur cache karne ke liye
    // Key: `/api/boards/${id}`
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/boards/${id}` : null,
        fetcher,
        {
            revalidateOnFocus: false, // Window change par baar baar fetch na ho
            dedupingInterval: 10000,  // 10 seconds tak cache fresh maana jaye
        }
    );

    // Card click handler: Jab user kisi card par click kare
    const handleCardClick = useCallback((card) => {
        setSelectedCard(card);
        setIsSidebarOpen(true);
    }, []);

    // Board data extraction
    const board = data?.board;
    const totalCards = board?.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0) ?? 0;

    // Loading State (SWR handled)
    if (isLoading) {
        return (
            <div className={`${urbanist.className} flex h-screen items-center justify-center bg-[#1d2125]`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-2 border-[#579dff]/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#579dff] animate-spin" />
                    </div>
                    <p className="text-[#9fadbc] text-[10px] font-bold tracking-[0.3em] uppercase">
                        Refining Workspace…
                    </p>
                </div>
            </div>
        );
    }

    // Error State (SWR handled)
    if (error || !board) {
        return (
            <div className={`${urbanist.className} flex h-screen items-center justify-center bg-[#1d2125]`}>
                <div className="text-center space-y-4">
                    <div className="text-5xl">🍵</div>
                    <h2 className="text-xl font-bold text-[#b6c2cf]">Board Not Found</h2>
                    <p className="text-[#9fadbc] text-sm">{data?.message || "Failed to connect to server"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${urbanist.className} ml-20 flex h-screen bg-[#1d2125] overflow-hidden text-[#b6c2cf]`}>
            <main className="flex-1 flex flex-col min-w-0">

                {/* Premium Header */}
                <header className="shrink-0 px-8 pt-8 pb-6 border-b border-white/5 bg-[#1d2125]/80 backdrop-blur-xl">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] text-[#579dff]/70 uppercase">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#579dff] animate-pulse" />
                                Interactive CRM Board
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#b6c2cf]">
                                {board.name}
                            </h1>
                            {board.description && (
                                <p className="text-[#9fadbc] text-sm font-medium max-w-xl line-clamp-1 opacity-70 italic">
                                    {board.description}
                                </p>
                            )}
                        </div>

                        {/* Real-time Stats */}
                        <div className="hidden md:flex items-center gap-8 pb-1">
                            <div className="text-right">
                                <p className="text-2xl font-light text-[#b6c2cf] leading-none">
                                    {board.lists?.length || 0}
                                </p>
                                <p className="text-[9px] font-black text-[#9fadbc]/50 uppercase tracking-widest mt-1.5">Lists</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-right">
                                <p className="text-2xl font-light text-[#b6c2cf] leading-none">{totalCards}</p>
                                <p className="text-[9px] font-black text-[#9fadbc]/50 uppercase tracking-widest mt-1.5">Total Cards</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Board Area */}
                <div className="flex-1 overflow-hidden">
                    <BoardContainer
                        lists={board.lists}
                        boardId={board.board_id}
                        onUpdate={mutate} // ✨ Mutate pass kiya taake refresh ho sakay
                        onCardClick={handleCardClick} // ✨ Card click handle karne ke liye
                    />
                </div>
            </main>

            {/* 🚀 Comment Sidebar: Dynamic data ke saath */}
            <CommentSidebar 
                card={selectedCard} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
        </div>
    );
}