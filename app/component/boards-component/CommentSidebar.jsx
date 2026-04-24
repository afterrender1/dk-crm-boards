"use client"
import React, { useState } from 'react';
import useSWR from 'swr';
import { X, MessageSquare, Send, Loader2, Clock } from 'lucide-react';


const PRIORITY_COLORS = {
    High: '#f87168',
    Medium: '#f5a623',
    Low: '#4bce97',
};

const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);
    const tmrw = new Date(today); tmrw.setDate(tmrw.getDate() + 1);

    if (target.getTime() === today.getTime()) return 'Today';
    if (target.getTime() === tmrw.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const getDueDateStatus = (dateString) => {
    if (!dateString) return 'none';
    const d = new Date(dateString);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);

    if (target < today) return 'overdue';
    if (target.getTime() === today.getTime()) return 'today';
    return 'future';
};

const DUE_DATE_COLORS = {
    overdue: '#f87168',
    today: '#f5a623',
    future: '#9fadbc',
    none: '#9fadbc',
};

const relativeTime = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHrs = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};


const fetcher = (url) => fetch(url).then(r => r.json());


const CommentSidebar = ({ card, isOpen, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // SWR: only fetches when sidebar is open and a card is selected
    const { data, mutate, isLoading } = useSWR(
        isOpen && card?.card_id ? `/api/cards/${card.card_id}/comments` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    );

    const comments = data?.comments ?? [];

    const handlePost = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/cards/${card.card_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText }),
            });
            const result = await res.json();
            if (result.success) {
                setCommentText('');
                mutate(); // refresh comment list via SWR
            } else {
                alert(result.message || 'Failed to post comment');
            }
        } catch (err) {
            console.error('Comment post error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cmd/Ctrl + Enter to submit
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost(e);
    };

    // Nothing to render without a card
    if (!card) return null;

    const priorityColor = PRIORITY_COLORS[card.priority] ?? PRIORITY_COLORS.Medium;
    const dueDateLabel = formatDueDate(card.due_date);
    const dueDateStatus = getDueDateStatus(card.due_date);
    const dueDateColor = DUE_DATE_COLORS[dueDateStatus];

    return (
        <>
            {/* ── Overlay ──────────────────────────────────────────────────── */}
            <div
                className={`
                    fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* ── Sidebar panel ─────────────────────────────────────────────── */}
            <aside
                className={`
                    fixed top-0 right-0 h-screen z-50
                    w-full sm:w-150
                    bg-[#22272b] border-l border-[#454f59]/40
                    flex flex-col
                    transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* ── Header ──────────────────────────────────────────────── */}
                <header className="shrink-0 px-5 py-4 bg-[#1d2125] border-b border-[#454f59]/40">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">

                            {/* Priority chip — text-xs up from text-[9px] */}
                            <span
                                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                                style={{
                                    color: priorityColor,
                                    background: `${priorityColor}18`,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: priorityColor }}
                                />
                                {card.priority}
                            </span>

                            {/* Card title — text-base sm:text-lg up from text-sm */}
                            <h2 className="text-base sm:text-lg font-semibold text-[#d1d5db] leading-snug line-clamp-2">
                                {card.title}
                            </h2>

                            {/* Due date row — only when set */}
                            {dueDateLabel && (
                                <div
                                    className="flex items-center gap-1.5 text-xs sm:text-sm font-medium"
                                    style={{ color: dueDateColor }}
                                >
                                    <Clock size={11} />
                                    {dueDateLabel}
                                    {dueDateStatus === 'overdue' && (
                                        <span className="font-bold">· Overdue</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="shrink-0 p-1.5 rounded-lg text-[#9ca3af] hover:bg-[#454f59]/40 hover:text-[#d1d5db] transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* ── Scrollable body ──────────────────────────────────────── */}
                <div
                    className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#454f59 transparent' }}
                >
                    {/* Description block — only when present */}
                    {card.description && (
                        <>
                            <section>
                                {/* Label: text-xs sm:text-sm up from text-[9px] */}
                                <p className="text-xs sm:text-sm font-black text-[#9ca3af]/60 uppercase tracking-widest mb-2">
                                    Description
                                </p>
                                {/* Body: text-sm sm:text-base up from text-xs */}
                                <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
                                    {card.description}
                                </p>
                            </section>
                            <div className="h-px bg-[#454f59]/30" />
                        </>
                    )}

                    {/* ── Discussion ──────────────────────────────────────── */}
                    <section>
                        {/* Section label + count */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs sm:text-sm font-black text-[#9ca3af]/60 uppercase tracking-widest flex items-center gap-1.5">
                                <MessageSquare size={12} />
                                Comments
                            </p>
                            {!isLoading && comments.length > 0 && (
                                <span className="text-xs font-bold text-[#9ca3af]/50 tabular-nums">
                                    {comments.length}
                                </span>
                            )}
                        </div>

                        {/* ── Input box (Notion / Linear flat style) ──────── */}
                        <form onSubmit={handlePost} className="mb-6">
                            <div className="bg-[#1d2125] border border-[#454f59]/50 rounded-lg overflow-hidden focus-within:border-[#454f59] transition-colors">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSubmitting}
                                    placeholder="Add a comment…"
                                    rows={3}
                                    className="
                                        w-full bg-transparent px-4 py-3
                                        text-sm sm:text-base text-[#d1d5db] placeholder:text-[#9fadbc]/40
                                        resize-none outline-none leading-relaxed
                                    "
                                />
                                {/* Toolbar row */}
                                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#454f59]/25">
                                    <span className="text-xs text-[#9ca3af]/40 select-none">
                                        ⌘ + Enter to post
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !commentText.trim()}
                                        className="
                                            flex items-center gap-1.5
                                            text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-md
                                            text-[#579dff] hover:bg-[#579dff]/10
                                            disabled:opacity-30 disabled:pointer-events-none
                                            transition-colors
                                        "
                                    >
                                        {isSubmitting
                                            ? <Loader2 size={12} className="animate-spin" />
                                            : <Send size={12} />
                                        }
                                        {isSubmitting ? 'Posting' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* ── Comments list ───────────────────────────────── */}
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2
                                    size={18}
                                    className="animate-spin text-[#9ca3af]/40"
                                />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-10">
                                <MessageSquare
                                    size={22}
                                    className="mx-auto mb-2.5 text-[#9ca3af]/25"
                                />
                                {/* text-sm up from text-xs */}
                                <p className="text-sm text-[#9ca3af]/40">
                                    No comments yet
                                </p>
                            </div>
                        ) : (
                            // space-y-5 up from space-y-4
                            <div className="space-y-5">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.comment_id}
                                        className="flex gap-3"
                                    >
                                        {/* Avatar — slightly larger */}
                                        <div className="
                                            shrink-0 w-7 h-7 mt-0.5 rounded-md
                                            bg-[#579dff]/12 border border-[#579dff]/20
                                            flex items-center justify-center
                                            text-xs font-bold text-[#579dff]
                                        ">
                                            A
                                        </div>

                                        {/* Bubble */}
                                        <div className="flex-1 min-w-0">
                                            {/* Author + timestamp */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {/* text-xs sm:text-sm up from text-[10px] */}
                                                <span className="text-xs sm:text-sm font-semibold text-[#d1d5db]">
                                                    You
                                                </span>
                                                {/* text-xs up from text-[9px] */}
                                                <span className="text-xs text-[#9ca3af]/50">
                                                    {relativeTime(comment.createdAt)}
                                                </span>
                                            </div>

                                            {/* Message bubble — border-[#454f59]/50 up from /35 */}
                                            <div className="
                                                bg-[#1d2125] border border-[#454f59]/50
                                                px-3.5 py-2.5 rounded-lg rounded-tl-none
                                                transition-colors hover:border-[#454f59]/70
                                            ">
                                                {/* text-sm sm:text-base lg:text-[15px] — fully responsive */}
                                                <p className="text-sm sm:text-base lg:text-[15px] text-[#9ca3af] leading-relaxed">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </aside>
        </>
    );
};

export default CommentSidebar;