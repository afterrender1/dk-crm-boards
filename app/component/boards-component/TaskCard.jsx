"use client"
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const PRIORITY_CONFIG = {
    High:   { label: 'High',   color: '#f87168', bg: 'rgba(248,113,104,0.15)' },
    Medium: { label: 'Medium', color: '#f5a623', bg: 'rgba(245,166,35,0.15)'  },
    Low:    { label: 'Low',    color: '#4bce97', bg: 'rgba(75,206,151,0.15)'  },
};

const TaskCard = React.memo(({ card, index }) => {
    const priority = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.Medium;

    return (
        <Draggable draggableId={card.card_id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    /* FIX: Dono style props ko ek hi object mein merge kar diya gaya hai.
                       provided.draggableProps.style ko hamesha pehle spread karen.
                    */
                    style={{
                        ...provided.draggableProps.style,
                        willChange: snapshot.isDragging ? 'transform' : 'auto',
                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                        background: snapshot.isDragging ? '#2c333a' : '#22272b',
                        // Dragging ke waqt agar card jump kare to transition: 'none' zaroori hai
                        transition: snapshot.isDragging ? 'none' : provided.draggableProps.style?.transition,
                    }}
                    className={`
                        relative group mb-2 px-3 py-3
                        rounded-lg border cursor-pointer select-none
                        text-[#b6c2cf]
                        ${snapshot.isDragging 
                            ? 'shadow-2xl shadow-black/40 opacity-95 border-[#579dff]/40' 
                            : 'border-transparent hover:border-[#454f59] transition-all duration-150'
                        }
                    `}
                >
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
                        <p className="text-sm font-medium text-[#b6c2cf] leading-snug">
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
    prev.card.description === next.card.description
);

TaskCard.displayName = 'TaskCard';
export default TaskCard;