"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Layers, Plus, ArrowRight, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { urbanist, inter } from '@/app/fonts'

const AllBoards = () => {
    const [boards, setBoards] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const headerRef = useRef(null)
    const gridRef = useRef(null)
    const cardsRef = useRef([])

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
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {boards.map((board, index) => (
                        <div
                            key={board.board_id}
                            ref={el => cardsRef.current[index] = el}
                            onMouseEnter={() => handleCardHover(index, true)}
                            onMouseLeave={() => handleCardHover(index, false)}
                            className="group relative cursor-pointer opacity-0"
                        >
                            {/* Card Background */}
                            <div
                                className="relative aspect-6/3 rounded-[28px] p-6 overflow-hidden transition-colors duration-500"
                                style={{ backgroundColor: '#57C9D8' }}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-black/5 pointer-events-none" />

                                {/* Floating accent circle */}
                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500" />

                                {/* Inner White Card */}
                                <div className="inner-card relative bg-white/80 backdrop-blur-xl rounded-[20px] p-5 shadow-sm border border-white/50 h-full flex flex-col justify-between transition-shadow duration-400">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-bold text-neutral-800 leading-tight group-hover:text-neutral-900 transition-colors">
                                                {board.name}
                                            </h2>
                                            {board.description && (
                                                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed max-w-50">
                                                    {board.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-all duration-300">
                                            <Layers className="w-5 h-5" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                                        <span className="text-xs text-neutral-400 font-medium">
                                            {new Date(board.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <button className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors group/btn">
                                            Open
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Board Card */}
                    <div
                        className="group relative cursor-pointer opacity-0"
                        ref={el => cardsRef.current[boards.length] = el}
                        onMouseEnter={() => handleCardHover(boards.length, true)}
                        onMouseLeave={() => handleCardHover(boards.length, false)}
                    >
                        <div className="aspect-6/3 rounded-[28px] border-2 border-dashed border-neutral-200 hover:border-neutral-400 bg-neutral-100/50 hover:bg-neutral-100 flex flex-col items-center justify-center gap-4 transition-all duration-300">
                            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Plus className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-400 group-hover:text-neutral-600">
                                Create New Board
                            </span>
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