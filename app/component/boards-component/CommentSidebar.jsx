"use client"
import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import { X, MessageSquare, Send, Loader2, Clock, Trash2, Pencil, Check, XCircle } from 'lucide-react';

const PRIORITY_COLORS = {
    High: '#f87168',
    Medium: '#f5a623',
    Low: '#4bce97',
};

const DUE_DATE_COLORS = {
    overdue: '#f87168',
    today: '#f5a623',
    future: '#9fadbc',
    none: '#9fadbc',
};

// ── Utils ──────────────────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────────────
const CommentSidebar = ({ card, isOpen, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [descriptionText, setDescriptionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit States
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    // SWR: fetching comments
    const { data, mutate, isLoading } = useSWR(
        isOpen && card?.card_id ? `/api/cards/${card.card_id}/comments` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    );

    const comments = data?.comments ?? [];

    // SWR: fetching descriptions
    const { data: desData, mutate: mutateDes, isLoading: isLoadingDes } = useSWR(
        isOpen && card?.card_id ? `/api/cards/${card.card_id}/descriptions` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60_000 }
    );

    const descriptions = desData?.descriptions ?? [];


    // ── Handlers ───────────────────────────────────────────────────

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
            if (res.ok) {
                setCommentText('');
                mutate();
            }
        } catch (err) { console.error(err); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (commentId) => {
        if (!confirm("Delete this comment?")) return;
        try {
            const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
            if (res.ok) mutate();
        } catch (err) { console.error('Delete failed:', err); }
    };

    const handleUpdate = async (commentId) => {
        if (!editText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editText }),
            });
            if (res.ok) {
                setEditingId(null);
                mutate();
            }
        } catch (err) { console.error('Update failed:', err); }
        finally { setIsSubmitting(false); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost(e);
    };

    // ── Description Handlers ───────────────────────────────────────

    const handlePostDescription = async (e) => {
        e.preventDefault();
        if (!descriptionText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/cards/${card.card_id}/descriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: descriptionText }),
            });
            if (res.ok) {
                setDescriptionText('');
                mutateDes();
            }
        } catch (err) { console.error('Post description failed:', err); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteDescription = async (descriptionId) => {
        if (!confirm("Delete this description?")) return;
        try {
            const res = await fetch(`/api/descriptions/${descriptionId}`, { method: 'DELETE' });
            if (res.ok) mutateDes();
        } catch (err) { console.error('Delete description failed:', err); }
    };

    const handleUpdateDescription = async (descriptionId) => {
        if (!editText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/descriptions/${descriptionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editText }),
            });
            if (res.ok) {
                setEditingId(null);
                mutateDes();
            }
        } catch (err) { console.error('Update description failed:', err); }
        finally { setIsSubmitting(false); }
    };

    if (!card) return null;

    const priorityColor = PRIORITY_COLORS[card.priority] ?? PRIORITY_COLORS.Medium;
    const dueDateLabel = formatDueDate(card.due_date);
    const dueDateStatus = getDueDateStatus(card.due_date);
    const dueDateColor = DUE_DATE_COLORS[dueDateStatus];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar panel */}
            <aside
                className={`fixed top-0 right-0 h-screen z-50 w-full sm:w-150 bg-[#22272b] border-l border-[#454f59]/40 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <header className="shrink-0 px-5 py-4 bg-[#1d2125] border-b border-[#454f59]/40">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                                style={{ color: priorityColor, background: `${priorityColor}18` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: priorityColor }} />
                                {card.priority}
                            </span>
                            <h2 className="text-base sm:text-lg font-semibold text-[#d1d5db] leading-snug line-clamp-2">{card.title}</h2>
                            {dueDateLabel && (
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium" style={{ color: dueDateColor }}>
                                    <Clock size={11} /> {dueDateLabel} {dueDateStatus === 'overdue' && <span className="font-bold">· Overdue</span>}
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg text-[#9ca3af] hover:bg-[#454f59]/40 hover:text-[#d1d5db] transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 custom-scrollbar">


                    {/* Descriptions Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs sm:text-sm font-black text-[#9ca3af]/60 uppercase tracking-widest">Descriptions</p>
                        </div>

                        {/* Add Description Form */}
                        <form onSubmit={handlePostDescription} className="mb-6">
                            <div className="bg-[#1d2125] border border-[#454f59]/50 rounded-lg overflow-hidden focus-within:border-[#579dff]/50 transition-all">
                                <textarea
                                    value={descriptionText}
                                    onChange={(e) => setDescriptionText(e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="Add a description…"
                                    rows={2}
                                    className="w-full bg-transparent px-4 py-3 text-sm sm:text-base text-[#d1d5db] placeholder:text-[#9fadbc]/40 resize-none outline-none leading-relaxed"
                                />
                                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#454f59]/25 bg-black/10">
                                    <span className="text-[10px] text-[#9ca3af]/40 uppercase font-bold tracking-tighter">⌘ + Enter to post</span>
                                    <button type="submit" disabled={isSubmitting || !descriptionText.trim()}
                                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md text-[#579dff] hover:bg-[#579dff]/10 disabled:opacity-30 transition-colors">
                                        {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                        Add
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Descriptions List */}
                        <div className="space-y-4 mb-8">
                            {isLoadingDes ? (
                                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#579dff]" /></div>
                            ) : descriptions.length === 0 ? (
                                <div className="text-center py-6 text-[#9ca3af]/40 text-sm">No descriptions yet</div>
                            ) : (
                                descriptions.map((desc) => (
                                    <div key={desc.description_id} className="group/desc">
                                        <div className="flex items-start justify-between mb-0">
                                            <span className="text-[8px] text-[#3dd816] tracking-widest font-medium">{relativeTime(desc.createdAt)}</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover/desc:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingId(desc.description_id); setEditText(desc.text); }}
                                                    className="p-1 text-[#9ca3af] hover:text-[#579dff] transition-colors"><Pencil size={12} /></button>
                                                <button onClick={() => handleDeleteDescription(desc.description_id)}
                                                    className="p-1 text-[#9ca3af] hover:text-[#f87168] transition-colors"><Trash2 size={12} /></button>
                                            </div>
                                        </div>

                                        {/* Description Bubble / Edit Mode */}
                                        {editingId === desc.description_id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    autoFocus
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full bg-[#1d2125] border border-[#579dff]/50 rounded-lg p-3 text-sm text-[#d1d5db] outline-none resize-none"
                                                    rows={2}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="p-1 text-[#9ca3af] hover:text-white"><XCircle size={16} /></button>
                                                    <button onClick={() => handleUpdateDescription(desc.description_id)} className="p-1 text-[#4bce97] hover:text-[#4bce97]/80"><Check size={16} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-[#1d2125] border border-[#454f59]/40 px-4 py-2 rounded-lg hover:border-[#454f59]/70 transition-colors">
                                                <p className="text-[14px] sm:text-[15px] text-[#9ca3af] leading-relaxed whitespace-pre-wrap">{desc.text}</p>

                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="h-px bg-[#454f59]/30 mb-4" />
                    </section>

                    {/* Discussion */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs sm:text-sm font-black text-[#9ca3af]/60 capitalize tracking-widest flex items-center gap-1.5">
                                <MessageSquare size={12} /> Comments
                            </p>
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handlePost} className="mb-8">
                            <div className="bg-[#1d2125] border border-[#454f59]/50 rounded-lg overflow-hidden focus-within:border-[#579dff]/50 transition-all">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSubmitting}
                                    placeholder="Add a comment…"
                                    rows={3}
                                    className="w-full bg-transparent px-4 py-3 text-sm sm:text-base text-[#d1d5db] placeholder:text-[#9fadbc]/40 resize-none outline-none leading-relaxed"
                                />
                                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#454f59]/25 bg-black/10">
                                    <span className="text-[10px] text-[#9ca3af]/40 uppercase font-bold tracking-tighter">⌘ + Enter to post</span>
                                    <button type="submit" disabled={isSubmitting || !commentText.trim()}
                                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md text-[#579dff] hover:bg-[#579dff]/10 disabled:opacity-30 transition-colors">
                                        {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                        Post
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-[#579dff]" /></div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-10 text-[#9ca3af]/40 text-sm">No comments yet</div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.comment_id} className="flex gap-3 group/comment">
                                        {/* Avatar */}
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#579dff]/10 border border-[#579dff]/20 flex items-center justify-center text-xs font-bold text-[#579dff]">
                                            {comment.author_name?.[0] || 'G'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm capitalize font-bold text-[#d1d5db]">guest</span>
                                                    <span className="text-[10px] text-[#3dd816] tracking-widest font-medium">{relativeTime(comment.createdAt)}</span>
                                                </div>

                                                {/* Actions: Edit/Delete (Show on hover) */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingId(comment.comment_id); setEditText(comment.text); }}
                                                        className="p-1 text-[#9ca3af] hover:text-[#579dff] transition-colors"><Pencil size={12} /></button>
                                                    <button onClick={() => handleDelete(comment.comment_id)}
                                                        className="p-1 text-[#9ca3af] hover:text-[#f87168] transition-colors"><Trash2 size={12} /></button>
                                                </div>
                                            </div>

                                            {/* Comment Bubble / Edit Mode */}
                                            {editingId === comment.comment_id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        autoFocus
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="w-full bg-[#1d2125] border border-[#579dff]/50 rounded-lg p-3 text-sm text-[#d1d5db] outline-none resize-none"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => setEditingId(null)} className="p-1 text-[#9ca3af] hover:text-white"><XCircle size={16} /></button>
                                                        <button onClick={() => handleUpdate(comment.comment_id)} className="p-1 text-[#4bce97] hover:text-[#4bce97]/80"><Check size={16} /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-[#1d2125] border border-[#454f59]/40 px-4 py-3 rounded-xl rounded-tl-none hover:border-[#454f59]/70 transition-colors">
                                                    <p className="text-[14px] sm:text-[15px] text-[#9ca3af] leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </aside>
        </>
    );
};

export default CommentSidebar;