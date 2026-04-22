"use client"
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import ListColumn from "./ListColumn";

const BoardContainer = React.memo(({ lists: initialLists, boardId, onUpdate }) => {
    const [isReady, setIsReady] = useState(false);
    const [isAddingList, setIsAddingList] = useState(false);
    const [listName, setListName] = useState("");
    const [localLists, setLocalLists] = useState(initialLists ?? []);

    // ── Drag-to-scroll refs ────────────────────────────────────
    const scrollRef = useRef(null);
    const isDraggingScroll = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => { setLocalLists(initialLists ?? []); }, [initialLists]);
    useEffect(() => { setIsReady(true); }, []);

    // ── Cursor anywhere horizontal scroll (no scrollbar) ──────
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onMouseDown = (e) => {
            // Don't hijack clicks on interactive elements
            if (e.target.closest('button, input, textarea, [data-rfd-draggable-id]')) return;
            isDraggingScroll.current = true;
            startX.current = e.pageX - el.offsetLeft;
            scrollLeft.current = el.scrollLeft;
            el.style.cursor = 'grabbing';
            el.style.userSelect = 'none';
        };

        const onMouseMove = (e) => {
            if (!isDraggingScroll.current) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX.current) * 1.2;
            el.scrollLeft = scrollLeft.current - walk;
        };

        const onMouseUp = () => {
            isDraggingScroll.current = false;
            el.style.cursor = '';
            el.style.userSelect = '';
        };

        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isReady]);

    // ── Optimistic drag end ────────────────────────────────────
    const onDragEnd = useCallback(async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        const newLists = localLists.map(l => ({
            ...l,
            cards: l.cards ? [...l.cards] : []
        }));

        const srcList = newLists.find(l => l.list_id.toString() === source.droppableId);
        const destList = newLists.find(l => l.list_id.toString() === destination.droppableId);
        if (!srcList || !destList) return;

        const [movedCard] = srcList.cards.splice(source.index, 1);
        destList.cards.splice(destination.index, 0, movedCard);
        setLocalLists(newLists);

        try {
            const res = await fetch(`/api/cards/${draggableId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    list_id: parseInt(destination.droppableId),
                    order_index: destination.index
                })
            });
            if (!res.ok) throw new Error('API error');
        } catch (err) {
            console.error("Drag update failed, reverting", err);
            onUpdate();
        }
    }, [localLists, onUpdate]);

    const handleAddList = useCallback(async () => {
        if (!listName.trim()) return;
        const res = await fetch(`/api/boards/${boardId}/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: listName })
        });
        if (res.ok) {
            setListName("");
            setIsAddingList(false);
            onUpdate();
        }
    }, [listName, boardId, onUpdate]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') handleAddList();
        if (e.key === 'Escape') setIsAddingList(false);
    }, [handleAddList]);

    const columnCallbacks = useMemo(() => {
        const map = {};
        (initialLists ?? []).forEach(l => { map[l.list_id] = onUpdate; });
        return map;
    }, [initialLists, onUpdate]);

    if (!isReady) return null;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div
                ref={scrollRef}
                className="
                    flex gap-3 h-full
                    items-start
                    overflow-x-auto overflow-y-hidden
                    px-4 py-4
                    select-none
                "
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {/* Hide webkit scrollbar */}
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                {localLists.map((list, i) => (
                    <ListColumn
                        key={list.list_id}
                        list={list}
                        onCardAdded={columnCallbacks[list.list_id] ?? onUpdate}
                        animationDelay={i * 60}
                    />
                ))}

                {/* Add List Panel */}
                {isAddingList ? (
                    <div
                        className="min-w-[272px] w-[272px] shrink-0 rounded-xl p-3"
                        style={{ background: '#282e33' }}
                    >
                        <input
                            autoFocus
                            className="
                                w-full rounded-lg px-3 py-2
                                text-sm font-semibold text-[#b6c2cf]
                                outline-none border-2 border-[#579dff]
                                placeholder:text-[#9fadbc]/40
                            "
                            style={{ background: '#22272b' }}
                            placeholder="Enter list title…"
                            value={listName}
                            onChange={(e) => setListName(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="flex gap-2 mt-2.5 items-center">
                            <button
                                onClick={handleAddList}
                                className="
                                    text-sm font-semibold px-4 py-1.5 rounded-md
                                    text-[#1d2125] bg-[#579dff]
                                    hover:bg-[#85b8ff]
                                    active:scale-95
                                    transition-all duration-150
                                "
                            >
                                Add list
                            </button>
                            <button
                                onClick={() => setIsAddingList(false)}
                                className="text-[#9fadbc] hover:text-[#b6c2cf] text-xl leading-none px-1 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingList(true)}
                        className="
                            min-w-[272px] w-[272px] shrink-0
                            flex items-center gap-2
                            px-4 py-3 rounded-xl
                            text-sm font-semibold text-[#b6c2cf]
                            hover:bg-white/10
                            active:scale-[0.98]
                            transition-all duration-200
                            whitespace-nowrap
                        "
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                        <span className="text-lg leading-none">+</span>
                        Add another list
                    </button>
                )}

                {/* Right buffer so last column isn't flush against edge */}
                <div className="min-w-[8px] shrink-0" />
            </div>
        </DragDropContext>
    );
});

BoardContainer.displayName = 'BoardContainer';
export default BoardContainer;