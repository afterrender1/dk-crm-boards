"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from "next/navigation";
import { urbanist } from "@/app/fonts";
import BoardContainer from "@/app/component/boards-component/BoardContainer";

export default function BoardPage() {
    const params = useParams();
    const id = params.id;

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBoardData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/boards/${id}`);
            const data = await res.json();

            if (data.success) {
                setBoard(data.board);
            } else {
                setError(data.message || "Board not found");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleListAdded = () => {
        fetchBoardData();
    };

    useEffect(() => {
        fetchBoardData();
    }, [id]);

    if (loading) {
        return (
            <div className={`${urbanist.className} flex h-screen items-center justify-center bg-[#FDFDFD]`}>
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-8 w-48 bg-neutral-100 rounded-full" />
                    <p className="text-neutral-300 text-[10px] font-bold tracking-[0.3em] uppercase">Refining Workspace...</p>
                </div>
            </div>
        );
    }

    if (error || !board) {
        return (
            <div className={`${urbanist.className} flex h-screen items-center justify-center bg-[#FDFDFD]`}>
                <div className="text-center space-y-4">
                    <div className="text-4xl">🍵</div>
                    <h2 className="text-xl font-bold text-neutral-800">Board Not Found</h2>
                    <p className="text-neutral-400 text-sm">{error || "The board you're looking for doesn't exist."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${urbanist.className} max-w-400 mx-auto flex h-screen bg-[#FDFDFD] overflow-hidden text-neutral-900`}>
            <main className="flex-1 flex flex-col min-w-0 bg-neutral-50/30">

                {/* Premium Header */}
                <header className="shrink-0 px-10 pt-12 pb-8 border-b border-neutral-200/50 bg-white/40 backdrop-blur-xl">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.25em] text-neutral-400 uppercase">
                                <span className="text-[#49bac9] animate-pulse">✦</span> Luxury CRM Workspace
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                                {board.name}
                            </h1>
                            {board.description && (
                                <p className="text-neutral-400 text-sm font-medium max-w-xl line-clamp-1">
                                    {board.description}
                                </p>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-8 pb-1">
                            <div className="text-right">
                                <p className="text-2xl font-light text-neutral-900 leading-none">{board.lists?.length || 0}</p>
                                <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-2">Segments</p>
                            </div>
                            <div className="w-px h-10 bg-neutral-200/60" />
                            <div className="text-right">
                                <p className="text-2xl font-light text-neutral-900 leading-none">
                                    {board.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0)}
                                </p>
                                <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-2">Total Tasks</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Board Content Area */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <BoardContainer lists={board.lists} boardId={board.board_id} onListAdded={handleListAdded} />
                </div>
            </main>
        </div>
    );
}