"use client"
import React, { useState, useCallback } from 'react';
import useSWR from 'swr';
import { X, MessageSquare, Tag, Send, Loader } from 'lucide-react';

// 1. Fetcher function: SWR ko batata hai data kaise lana hai
const fetcher = (url) => fetch(url).then((res) => res.json());

const CommentSidebar = ({ card, isOpen, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. SWR Hook: Yeh automatically caching aur revalidation handle karta hai
    // Agar Sidebar closed hai ya card nahi hai, toh fetcher 'null' rahay ga (no API hit)
    const { data, mutate, isLoading } = useSWR(
        isOpen && card?.card_id ? `/api/cards/${card.card_id}/comments` : null,
        fetcher,
        {
            revalidateOnFocus: false, // Window switch karne par bar bar fetch na ho
            dedupingInterval: 60000,  // 1 minute tak same card ke liye cache valid rahay ga
        }
    );

    const comments = data?.comments || [];

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/cards/${card.card_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText })
            });

            const result = await res.json();
            if (result.success) {
                setCommentText('');
                // 3. Mutate: SWR ko bolo ke backend se data refresh kare
                // Taake naya comment foran list mein nazar aa jaye
                mutate();
            } else {
                alert(result.message || 'Failed to post comment');
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    if (!card) return null;

    return (
        <>
            {/* Background Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel - Dark Theme, Responsive */}
            <div className={`fixed top-0 right-0 h-screen w-full sm:w-96 md:w-112.5 bg-[#22272b] shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-l border-[#454f59]/50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="px-4 py-3 border-b border-[#454f59]/30 flex justify-between items-start gap-2 bg-[#1d2125]/50">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#579dff]/70 uppercase tracking-wider bg-[#579dff]/10 px-2 py-1 rounded-lg border border-[#579dff]/20">
                            <Tag size={10} /> {card.priority}
                        </div>
                        <h2 className="text-lg font-bold text-[#b6c2cf] leading-tight truncate">{card.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#454f59]/50 rounded-lg text-[#9fadbc] transition-all active:scale-90 shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="px-4 py-3 overflow-y-auto h-[calc(100vh-60px)] custom-scrollbar space-y-4 pb-20">
                    {/* Description Section */}
                    <div className="group">
                        <h4 className="text-[9px] font-bold text-[#579dff]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#579dff]/60" />
                            Description
                        </h4>
                        <p className="text-xs text-[#9fadbc] leading-relaxed bg-[#1d2125]/50 p-3 rounded-lg border border-[#454f59]/30 group-hover:border-[#579dff]/40 transition-colors">
                            {card.description || "No description provided for this task."}
                        </p>
                    </div>

                    {/* Discussion Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3 gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-lg bg-[#579dff]/10 border border-[#579dff]/20 flex items-center justify-center">
                                    <MessageSquare size={12} className="text-[#579dff]" />
                                </div>
                                <h4 className="text-[9px] font-bold text-[#579dff]/60 uppercase tracking-wider">Discussion</h4>
                            </div>
                            <span className="text-[9px] font-bold bg-[#579dff]/10 px-2 py-1 rounded-lg border border-[#579dff]/20 text-[#579dff]/80 whitespace-nowrap">
                                {comments.length}
                            </span>
                        </div>

                        {/* Comment Input Panel */}
                        <form onSubmit={handlePostComment} className="mb-3 bg-[#1d2125]/60 border border-[#454f59]/30 rounded-lg p-1.5 shadow-sm focus-within:border-[#579dff]/50 focus-within:shadow-lg focus-within:shadow-[#579dff]/10 transition-all">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full bg-transparent p-2 text-xs outline-none resize-none text-[#b6c2cf] min-h-16 placeholder:text-[#9fadbc]/40"
                                placeholder="Share your thoughts..."
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between items-center p-1.5 border-t border-[#454f59]/20 gap-2">
                                <div className="h-6 w-6 rounded-lg bg-[#579dff]/15 border border-[#579dff]/20 flex items-center justify-center text-[9px] text-[#579dff] font-bold shrink-0">A</div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="bg-[#579dff]/15 hover:bg-[#579dff]/25 disabled:opacity-30 text-[#579dff] text-[9px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 border border-[#579dff]/20 whitespace-nowrap"
                                >
                                    {isSubmitting ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                                    {isSubmitting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <Loader className="animate-spin text-[#579dff]" size={20} />
                                    <p className="text-[9px] font-bold text-[#579dff]/60 uppercase tracking-wider">Loading...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-[#454f59]/30 rounded-lg bg-[#1d2125]/30">
                                    <MessageSquare size={24} className="mx-auto mb-2 text-[#579dff]/20" />
                                    <p className="text-xs text-[#9fadbc]/50 font-medium">No comments yet</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.comment_id} className="flex gap-2 animate-in slide-in-from-bottom-2 duration-300 group/comment">
                                        <div className="h-7 w-7 rounded-lg bg-[#579dff]/15 border border-[#579dff]/20 flex items-center justify-center text-[9px] text-[#579dff] font-bold shrink-0">A</div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center gap-1.5 text-[9px]">
                                                <p className="font-bold text-[#579dff]/70 uppercase tracking-wider">You</p>
                                                <span className="h-0.5 w-0.5 bg-[#454f59]/50 rounded-full" />
                                                <p className="text-[#9fadbc]/50">{formatDate(comment.createdAt)}</p>
                                            </div>
                                            <div className="bg-black/60 p-2.5 rounded-lg rounded-tl-none border border-[#454f59]/30 group-hover/comment:border-[#579dff]/40 group-hover/comment:bg-[#1d2125]/80 transition-all">
                                                <p className="text-sm text-[#9fadbc] capitalize leading-relaxed">{comment.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommentSidebar;