"use client"
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FaTrash } from "react-icons/fa6";

const PRIORITY_CONFIG = {
    High: { label: 'High', color: '#f87168', bg: 'rgba(248,113,104,0.15)' },
    Medium: { label: 'Medium', color: '#f5a623', bg: 'rgba(245,166,35,0.15)' },
    Low: { label: 'Low', color: '#4bce97', bg: 'rgba(75,206,151,0.15)' },
};

const TaskCard = React.memo(({ card, index, onCardAdded, onCardClick }) => {
    const priority = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.Medium;

    const handleDelete = (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${card.title}"?`)) return;

        fetch(`/api/cards/${card.card_id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    onCardAdded?.();
                } else {
                    alert(data.message || "Failed to delete card");
                }
            })
            .catch(err => {
                console.error("Delete error:", err);
                alert("Failed to delete card");
            });
    }

    const handleCardClick = (e) => {
        // Only trigger on card click, not on button clicks or drag
        if (e.target.closest('button') || e.target.closest('.no-click')) {
            return;
        }
        onCardClick?.(card);
    }

    return (
        <Draggable draggableId={card.card_id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={handleCardClick}
                    style={{
                        ...provided.draggableProps.style,
                        willChange: snapshot.isDragging ? 'transform' : 'auto',
                        opacity: snapshot.isDragging ? 0.98 : 1,
                    }}
                    className={`
                        relative group mb-2 px-3 py-3
                        rounded-lg border cursor-grab active:cursor-grabbing select-none
                        text-[#b6c2cf]
                        transition-all duration-100
                        ${snapshot.isDragging
                            ? 'shadow-2xl shadow-black/60 opacity-98 border-[#3d9ca8]/60 bg-[#2c333a] z-9999'
                            : 'border-transparent hover:border-[#454f59] bg-[#22272b]'
                        }
                    `}
                >
                    <div className='z-50 absolute right-1 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                        {/* Delete button */}
                        <button
                            onClick={handleDelete}
                            className='p-1.5 rounded-md text-[#9fadbc]/50 hover:text-[#f87168] hover:bg-[#f87168]/10 transition-all duration-200'
                            title="Delete card"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                    {/* Hover highlight background */}
                    {!snapshot.isDragging && (
                        <div className="
                            absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                            transition-opacity duration-150
                            pointer-events-none
                        "
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                        />
                    )}

                    <div className="relative z-10 space-y-2">
                        {/* Title */}
                        <p className="text-sm font-medium text-[#b6c2cf] leading-snug overflow-wrap">
                            {card.title}
                        </p>

                        {/* Description */}
                        {card.description && (
                            <p className="text-xs text-[#9fadbc]/60 line-clamp-2 leading-relaxed">
                                {card.description}
                            </p>
                        )}

                        {/* Footer row */}
                        {card.priority && (
                            <div className="flex items-center justify-between pt-1.5">
                                <span
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{ color: priority.color, background: priority.bg }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ background: priority.color }}
                                    />
                                    {priority.label}
                                </span>
                                <span className="text-[10px] text-[#9fadbc]/30 font-mono">
                                    #{card.card_id.toString().slice(-4)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}, (prev, next) =>
    prev.index === next.index &&
    prev.card.card_id === next.card.card_id &&
    prev.card.title === next.card.title &&
    prev.card.priority === next.card.priority &&
    prev.card.description === next.card.description &&
    prev.onCardClick === next.onCardClick
);

TaskCard.displayName = 'TaskCard';
export default TaskCard;