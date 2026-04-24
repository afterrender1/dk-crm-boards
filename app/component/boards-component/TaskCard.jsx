"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Trash2, Edit3, Circle } from 'lucide-react';

const PRIORITY_CONFIG = {
    High: { label: 'High', color: '#f87168', bg: 'rgba(248,113,104,0.15)' },
    Medium: { label: 'Medium', color: '#f5a623', bg: 'rgba(245,166,35,0.15)' },
    Low: { label: 'Low', color: '#4bce97', bg: 'rgba(75,206,151,0.15)' },
};

const TaskCard = React.memo(({ card, index, onCardAdded, onCardClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: card.title, description: card.description });
    const menuRef = useRef(null);

    const priority = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.Medium;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    // 🚀 Common PATCH Function
    const updateCard = async (updates) => {
        try {
            const res = await fetch(`/api/cards/${card.card_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success) {
                onCardAdded?.(); // Refresh board (SWR mutate)
                setIsEditing(false);
                setShowMenu(false);
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${card.title}"?`)) return;
        fetch(`/api/cards/${card.card_id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => data.success && onCardAdded?.());
    };

    return (
        <>
            <Draggable draggableId={card.card_id.toString()} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => onCardClick?.(card)}
                        className={`relative group mb-1.5 px-3 py-2.5 rounded-lg border transition-all duration-200 select-none ${snapshot.isDragging
                            ? 'shadow-2xl border-[#3d9ca8]/60 bg-[#2c333a] scale-[1.02] z-9999'
                            : 'border-transparent hover:border-[#454f59] bg-[#22272b] hover:shadow-lg'
                            }`}
                    >
                        {/* 3 DOTS MENU TRIGGER */}
                        <div className='absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-30' ref={menuRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className={`p-1.5 rounded-md hover:bg-white/10 text-[#9fadbc] ${showMenu ? 'bg-white/10 opacity-100' : ''}`}
                            >
                                <MoreHorizontal size={14} />
                            </button>

                            {/* DROPDOWN MENU */}
                            {showMenu && (
                                <div className="z-999 absolute right-0 mt-2 w-48 bg-[#1d2125] border border-[#454f59] shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <div className="p-1">
                                        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#b6c2cf] hover:bg-white/5 rounded-lg transition-colors">
                                            <Edit3 size={12} /> Edit Card
                                        </button>

                                        <div className="h-px bg-white/5 my-0.5" />

                                        {/* Quick Priority Change */}
                                        <p className="px-3 py-1 text-[9px] font-black text-[#9fadbc]/40 uppercase tracking-widest">Set Priority</p>
                                        {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                                            <button
                                                key={key}
                                                onClick={(e) => { e.stopPropagation(); updateCard({ priority: key }); setShowMenu(false); }}
                                                className="flex items-center justify-between w-full px-3 py-2 text-xs text-[#b6c2cf] hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Circle size={8} fill={val.color} color={val.color} />
                                                    {val.label}
                                                </div>
                                                {card.priority === key && <div className="w-1 h-1 rounded-full bg-[#579dff]" />}
                                            </button>
                                        ))}

                                        <div className="h-px bg-white/5 my-0.5" />

                                        <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#f87168] hover:bg-[#f87168]/10 rounded-lg transition-colors">
                                            <Trash2 size={12} /> Delete Card
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CARD CONTENT */}
                        <div className="relative z-10 space-y-1.5">
                            <p className="text-sm font-medium text-[#b6c2cf] leading-snug">{card.title}</p>
                            {card.description && (
                                <p className="text-xs text-[#9fadbc]/60 line-clamp-2 leading-relaxed font-light">{card.description}</p>
                            )}

                            {/* Priority Badge */}
                            <div className="flex items-center justify-between pt-0.5">
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{ color: priority.color, background: priority.bg }}>
                                    <span className="w-1 h-1 rounded-full" style={{ background: priority.color }} />
                                    {priority.label}
                                </span>
                                <span className="text-[9px] text-[#9fadbc]/20 font-mono tracking-tighter">#{card.card_id}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>

            {/* QUICK EDIT MODAL - PORTAL OVERLAY */}
            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center z-10000 p-1 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setIsEditing(false); }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    <div className="relative w-full max-w-md bg-[#22272b] border border-[#454f59] rounded-2xl shadow-2xl overflow-hidden my-auto">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#579dff] to-[#3d9ca8]" />
                        <div className="px-3 py-5">
                            <h3 className="text-lg font-bold text-[#b6c2cf] mb-4">Edit Task</h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black text-[#9fadbc]/50 uppercase tracking-widest block mb-1.5">Title</label>
                                    <input
                                        className="w-full bg-[#1d2125] border border-[#454f59] rounded-xl px-3.5 py-2 text-sm text-[#b6c2cf] outline-none focus:border-[#579dff] transition-all"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-[#9fadbc]/50 uppercase tracking-widest block mb-1.5">Description</label>
                                    <textarea
                                        className="w-full bg-[#1d2125] border border-[#454f59] rounded-xl px-3.5 py-2 text-sm text-[#b6c2cf] outline-none focus:border-[#579dff] transition-all resize-none min-h-25"
                                        value={editData.description || ""}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => updateCard(editData)}
                                        className="flex-1 bg-[#579dff] hover:bg-[#4c8be0] text-[#1d2125] font-bold text-xs py-2 rounded-xl transition-all active:scale-95"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-[#2c333a] hover:bg-[#343c44] text-[#b6c2cf] font-bold text-xs py-2 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;