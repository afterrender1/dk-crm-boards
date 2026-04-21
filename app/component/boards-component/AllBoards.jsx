"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Layers, Plus, ArrowRight, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { urbanist, inter } from '@/app/fonts'
import { MdOutlineDeleteOutline } from "react-icons/md";


const AllBoards = () => {
    const [boards, setBoards] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const headerRef = useRef(null)
    const gridRef = useRef(null)
    const cardsRef = useRef([])
    const formatRelativeTime = (date) => {
        const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (diffInSeconds < 60) return 'Just now';

        const intervals = {
            year: 31536000, month: 2592000, week: 604800,
            day: 86400, hour: 3600, minute: 60
        };

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

const handleDelete = async (boardId) => {
    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
        return;
    }   
    try {
        const res = await fetch(`/api/boards/${boardId}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to delete board');
        }
        setBoards(prev => prev.filter(board => board.board_id !== boardId));
    } catch (err) {
        console.error("Delete error:", err);
        alert(err.message || "An error occurred while deleting the board.");
    }
}

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await fetch('/api/boards')
                const data = await res.json()
                if (data.success) {
                    setBoards(data.boards || [data.board])
                }
                else {
                    setError(data.message || 'Failed to fetch boards')
                }
            } catch (err) {
                setError('Network error')
            }
            finally {
                setLoading(false)
            }
        }
        fetchBoards()
    }, [])




    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await fetch('/api/boards')
                const data = await res.json()

                if (data.success) {
                    setBoards(data.boards || [data.board])
                } else {
                    setError(data.message || 'Failed to fetch boards')
                }
            } catch (err) {
                setError('Network error')
            } finally {
                setLoading(false)
            }
        }
        fetchBoards()
    }, [])

    // GSAP entrance animations
    useEffect(() => {
        if (!loading && boards.length > 0) {
            const ctx = gsap.context(() => {
                // Header fade in
                gsap.fromTo(headerRef.current,
                    { opacity: 0, y: -30 },
                    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
                )

                // Staggered card entrance
                gsap.fromTo(cardsRef.current,
                    { opacity: 0, y: 60, scale: 0.9 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        stagger: 0.12,
                        ease: "back.out(1.4)",
                        delay: 0.3
                    }
                )
            })

            return () => ctx.revert()
        }
    }, [loading, boards])

    // Hover animation handler
    const handleCardHover = (index, isEntering) => {
        const card = cardsRef.current[index]
        if (!card) return

        gsap.to(card, {
            scale: isEntering ? 1.03 : 1,
            y: isEntering ? -8 : 0,
            duration: 0.4,
            ease: "power2.out"
        })

        // Inner glow effect
        const inner = card.querySelector('.inner-card')
        gsap.to(inner, {
            boxShadow: isEntering
                ? "0 20px 40px -10px rgba(0,0,0,0.15)"
                : "0 4px 6px -1px rgba(0,0,0,0.05)",
            duration: 0.4
        })
    }

    if (loading) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                <span className="text-sm text-neutral-500 tracking-wide">Loading workspace...</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
                <p className="text-red-600/80 text-sm">{error}</p>
            </div>
        </div>
    )

    return (
        <div className={`min-h-screen bg-[#ebf5f7] p-6 md:p-12 lg:p-16 font-sans selection:bg-neutral-900 selection:text-white ${urbanist.className}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header ref={headerRef} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 md:mb-16 opacity-0">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Workspace Overview
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight 
               bg-linear-to-r from-[#3d9ca8] to-[#128fa0] bg-clip-text text-transparent">
                            Devskarnel<br className=" hidden" /> Private Trello
                        </h1>
                        <p className="text-neutral-500 text-lg md:text-xl max-w-md leading-relaxed">
                            Your private space for ideas, tasks, and everything that matters.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-5xl md:text-6xl font-bold text-neutral-900 tabular-nums leading-none">
                                {boards.length}
                            </div>
                            <div className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase mt-2">
                                Active Boards
                            </div>
                        </div>
                        <button className="hidden md:flex items-center gap-2 bg-[#49bac9] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1fd6ee] transition-colors active:scale-95">
                            <Plus className="w-4 h-4" />

                            New Board
                        </button>
                    </div>
                </header>

                {/* Boards Grid */}
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
                    {boards.map((board, index) => (
                        <div
                            key={board.board_id}
                            ref={el => cardsRef.current[index] = el}
                            onMouseEnter={() => handleCardHover(index, true)}
                            onMouseLeave={() => handleCardHover(index, false)}
                            className="group relative cursor-pointer opacity-0 perspective-1000"
                        >
                            {/* Card Shadow & Lift Effect Container */}
                            <div className="relative aspect-16/10 rounded-[32px] p-4 transition-all duration-500 ease-out 
                            group-hover:-translate-y-2 group-hover:rotate-[0.5deg]">

                                {/* Main Colored Background */}
                                <div
                                    className="absolute inset-0 rounded-[32px] transition-transform duration-500 group-hover:scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                                    style={{ backgroundColor: board.bg_color || '#57C9D8' }}
                                >
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                </div>

                                {/* Refined Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                      handleDelete(board.board_id);
                                    }}
                                    className="absolute top-2 right-6 z-30 p-1.5 rounded-xl
                               bg-white/20 backdrop-blur-md text-white border border-red-300
                               hover:bg-red-500 hover:border-red-500
                               opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                               transition-all duration-300 ease-spring "
                                    title="Delete Board"
                                >
                                    <MdOutlineDeleteOutline size={20} />
                                </button>

                                {/* Inner Card (The Premium Glass) */}
                                <div className="relative h-full w-full bg-white/75 backdrop-blur-xl rounded-[24px] p-6 
                                shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
                                border border-white/60 flex flex-col justify-between overflow-hidden">

                                    {/* Hover Shine Effect */}
                                    <div className="absolute -inset-full top-0 block w-1/2 h-full z-5 bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-12 group-hover:animate-shine" />

                                    <div className="flex justify-between items-start z-10">
                                        <div className="space-y-1.5">
                                            <h2 className="text-2xl font-bold text-neutral-800 tracking-tight leading-none">
                                                {board.name}
                                            </h2>
                                            {board.description ? (
                                                <p className="text-xs font-medium text-neutral-500/80 line-clamp-2 leading-relaxed max-w-45">
                                                    {board.description}
                                                </p>
                                            ) : (
                                                <p className="text-xs italic text-neutral-400">No description provided</p>
                                            )}
                                        </div>

                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center 
                                        group-hover:bg-[#1fd6ee] group-hover:text-white group-hover:border-[#1fd6ee] 
                                        duration-500 shadow-sm">
                                            <Layers className="w-5 h-5" strokeWidth={1.8} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between z-10 mt-6">
                                        <div className="flex flex-col">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                                                    Activity
                                                </span>
                                                <span
                                                    className="text-xs font-semibold text-neutral-600 cursor-help"
                                                    title={new Date(board.created_at).toLocaleString()} // Shows full date on hover
                                                >
                                                    {formatRelativeTime(board.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <button className="group/btn flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold 
                                         hover:bg-[#1fd6ee] transition-all duration-300 active:scale-95 shadow-lg shadow-neutral-900/10">
                                            Open Board
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Board Card (The "Ghost" Style) */}
                    <div
                        className="group relative cursor-pointer opacity-0"
                        ref={el => cardsRef.current[boards.length] = el}
                    >
                        <div className="aspect-16/10 rounded-[32px] border-2 border-dashed border-neutral-200 
                        bg-neutral-50/50 hover:bg-white hover:border-[#1fd6ee] hover:shadow-2xl hover:shadow-[#1fd6ee]/10
                        flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:-translate-y-1">
                            <div className="w-16 h-16 rounded-3xl bg-white shadow-xl shadow-neutral-200/50 flex items-center justify-center 
                            group-hover:scale-110 border border-neutral-50">
                                <Plus className="w-8 h-8 text-[#49bac9]" strokeWidth={2.5} />
                            </div>
                            <div className="text-center">
                                <span className="block text-sm font-bold text-neutral-800">Create New Board</span>
                                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Add to workspace</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {!boards.length && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layers className="w-10 h-10 text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No boards yet</h3>
                        <p className="text-neutral-500 mb-6">Create your first board to get started</p>
                        <button className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                            <Plus className="w-4 h-4" />
                            Create Board
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllBoards