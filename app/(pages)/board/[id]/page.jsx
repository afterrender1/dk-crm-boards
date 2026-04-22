"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from "next/navigation";
import { urbanist } from "@/app/fonts";
import BoardContainer from "@/app/component/boards-component/BoardContainer";

export default function BoardPage() {
    const params = useParams();
    const id = params?.id;

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBoardData = useCallback(async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/boards/${id}`);
            const data = await res.json();
            if (data.success) {
                setBoard(data.board);
                setError(null);
            } else {
                setError(data.message || "Board not found");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBoardData();
    }, [fetchBoardData]);

    if (loading) {
        return (
            <div className={`${urbanist.className} flex h-screen items-center justify-center bg-[#1d2125]`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-2 border-[#579dff]/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#579dff] animate-spin" />
                    </div>
                    <p className="text-[#9fadbc] text-[10px] font-bold tracking-[0.3em] uppercase">
                        Loading Board…
                    </p>
                </div>
            </div>
        );
    }

    if (error || !board) {
        return (
            <div className={`${urbanist.className} flex h-screen items-center justify-center bg-[#1d2125]`}>
                <div className="text-center space-y-4">
                    <div className="text-5xl">🍵</div>
                    <h2 className="text-xl font-bold text-[#b6c2cf]">Board Not Found</h2>
                    <p className="text-[#9fadbc] text-sm">{error || "The board you're looking for doesn't exist."}</p>
                </div>
            </div>
        );
    }

    const totalCards = board.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0) ?? 0;

    return (
        <div className={`${urbanist.className} ml-20 flex h-screen bg-[#1d2125] overflow-hidden text-[#b6c2cf]`}>
            <main className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <header className="shrink-0 px-8 pt-8 pb-6 border-b border-white/8 bg-[#1d2125]/80 backdrop-blur-xl">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] text-[#579dff]/70 uppercase">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#579dff] animate-pulse" />
                                Workspace Board
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#b6c2cf]">
                                {board.name}
                            </h1>
                            {board.description && (
                                <p className="text-[#9fadbc] text-sm font-medium max-w-xl line-clamp-1 opacity-70">
                                    {board.description}
                                </p>
                            )}
                        </div>

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
                                <p className="text-[9px] font-black text-[#9fadbc]/50 uppercase tracking-widest mt-1.5">Cards</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Board */}
                <div className="flex-1 overflow-hidden">
                    <BoardContainer
                        lists={board.lists}
                        boardId={board.board_id}
                        onUpdate={fetchBoardData}
                    />
                </div>
            </main>
        </div>
    );
}