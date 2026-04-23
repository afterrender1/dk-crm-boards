"use client"
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { FaTrash } from "react-icons/fa6";
import { ImSpinner8 } from "react-icons/im";

import TaskCard from "./TaskCard";

const ListColumn = React.memo(({ list, onCardAdded, onCardClick, animationDelay = 0, isDragging = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visible, setVisible] = useState(false);
    const columnRef = useRef(null);
    const [loading, setLoading] = useState(false)

    // Staggered fade-in animation on mount
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), animationDelay);
        return () => clearTimeout(t);
    }, [animationDelay]);

    const handleDeleteList = useCallback(async () => {
        if (!window.confirm(`Delete "${list.name}" and all its cards?`)) return;
        try {
            const res = await fetch(`/api/lists/${list.list_id}`, { method: 'DELETE' });
            if (res.ok) {
                onCardAdded();
            } else {
                const d = await res.json();
                alert(d.message || "Failed to delete list");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting list");
        }
    }, [list.list_id, list.name, onCardAdded]);

    const handleAddCard = useCallback(async () => {
        if (!title.trim()) return;
        try {
            setLoading(true)
            const res = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    list_id: list.list_id,
                    priority: 'Medium',
                    order_index: list.cards?.length ?? 0
                })
            });
            if (res.ok) {
                setLoading(false)
                setTitle("");
                setIsAdding(false);
                onCardAdded();
            }
        } catch (err) {
            setLoading(false), console.error(err);
        }
    }, [title, description, list.list_id, list.cards?.length, onCardAdded]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
        if (e.key === 'Escape') setIsAdding(false);
    }, [handleAddCard]);

    return (
        <div
            ref={columnRef}
            className="min-w-68 w-68 shrink-0 flex flex-col max-h-[calc(100vh-160px)] rounded-xl group/col"
            style={{
                background: '#101204',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}
        >
            {/* Column Header */}
            <div className="flex justify-between items-center px-3 pt-3 pb-2 shrink-0">
                <h3 className="text-sm font-bold text-[#b6c2cf] flex-1 truncate pr-2">
                    {list.name}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-semibold text-[#9fadbc]/60 min-w-4.5 text-center">
                        {list.cards?.length ?? 0}
                    </span>
                    <button
                        onClick={handleDeleteList}
                        title="Delete list"
                        className="
                            opacity-0 group-hover/col:opacity-100
                            p-1.5 rounded-md
                            text-[#9fadbc]/50 hover:text-[#f87168] hover:bg-[#f87168]/10
                            transition-all duration-200
                        "
                    >
                        <FaTrash size={13} />
                    </button>
                </div>
            </div>

            {/* Droppable card list */}
            <Droppable droppableId={list.list_id.toString()} type="CARD">
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden px-2 min-h-2"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#454f59 transparent',
                            background: snapshot.isDraggingOver
                                ? 'rgba(87,157,255,0.1)'
                                : 'rgba(87,157,255,0.02)',
                            borderRadius: '8px',
                            transition: 'background 0.12s ease-out',
                            outline: snapshot.isDraggingOver ? '2px solid rgba(87,157,255,0.3)' : 'none',
                        }}
                    >
                        {list.cards?.map((card, index) => (
                            <TaskCard
                                key={card.card_id}
                                card={card}
                                index={index}
                                onCardAdded={onCardAdded}
                                onCardClick={onCardClick}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            {/* Add Card Section */}
            <div className="shrink-0 px-2 pb-2 pt-1">
                {isAdding ? (
                    <div
                        className="rounded-lg p-2"
                        style={{ background: '#22272b' }}
                    >
                        <textarea
                            autoFocus
                            rows={3}
                            className="
                                w-full rounded-md px-2.5 py-2
                                text-sm text-[#b6c2cf] resize-none
                                outline-none
                                placeholder:text-[#9fadbc]/40
                                focus:ring-2 focus:ring-[#3d9ca8]/50
                                ring-1 ring-[#3d9ca8]/50

                            "
                            style={{ background: '#22272b' }}
                            placeholder="Enter a title for this card…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <textarea
                            
                            rows={3}
                            className="
                                w-full rounded-md px-2.5 py-2
                                text-sm text-[#b6c2cf] resize-none
                                outline-none
                                placeholder:text-[#ffff]/40
                                focus:ring-2 focus:ring-[#3d9ca8]/50
                                ring-1 ring-[#3d9ca8]/50
                            "
                            style={{ background: '#22272b' }}
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />


                        <div className="flex gap-2 items-center mt-2">
                            <button
                                onClick={handleAddCard}
                                className="
                                    text-sm font-semibold px-4 py-1.5 rounded-md
                                    text-[#1d2125] bg-[#3d9ca8]
                                    hover:bg-[#85b8ff]
                                    active:scale-95
                                    transition-all duration-150
                                "
                            >
                                <div className='flex justify-center items-center gap-1'>
                                    {loading && <span className='animate-spin'>
                                        <ImSpinner8 />
                                    </span>}
                                    Add card
                                </div>
                            </button>
                            <button
                                onClick={() => { setIsAdding(false); setTitle(""); }}
                                className="text-[#9fadbc] hover:text-[#b6c2cf] text-xl leading-none px-1 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="
                            w-full flex items-center gap-1.5 px-2.5 py-2
                            text-sm text-[#9fadbc]
                            hover:bg-[#579dff]/15 hover:text-[#b6c2cf]
                            rounded-lg
                            active:scale-[0.98]
                            transition-all duration-150
                        "
                    >
                        <span className="text-base leading-none">+</span>
                        Add a card
                    </button>
                )}
            </div>
        </div>
    );
}, (prev, next) =>
    prev.list === next.list &&
    prev.onCardAdded === next.onCardAdded &&
    prev.onCardClick === next.onCardClick &&
    prev.animationDelay === next.animationDelay
);

ListColumn.displayName = 'ListColumn';
export default ListColumn;