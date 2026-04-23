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

            {/* Sidebar Panel */}
            <div className={`fixed top-0 right-0 h-screen w-112.5 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-l border-neutral-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-8 border-b border-neutral-100 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#49bac9] uppercase tracking-widest">
                            <Tag size={12} /> {card.priority} Priority
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 leading-tight">{card.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-all active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="p-8 overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar pb-32">
                    {/* Description Section */}
                    <div className="mb-10 group">
                        <h4 className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em] mb-4">Description</h4>
                        <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50/50 p-5 rounded-[1.5rem] border border-neutral-100 group-hover:border-[#49bac9]/20 transition-colors">
                            {card.description || "No description provided for this task."}
                        </p>
                    </div>

                    {/* Discussion Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-[#49bac9]" />
                                <h4 className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">Discussion</h4>
                            </div>
                            <span className="text-[10px] font-bold bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100 text-neutral-400">
                                {comments.length} Comments
                            </span>
                        </div>

                        {/* Comment Input Panel */}
                        <form onSubmit={handlePostComment} className="mb-10 bg-white border border-neutral-100 rounded-[1.5rem] p-2 shadow-sm focus-within:border-[#49bac9]/40 focus-within:shadow-lg focus-within:shadow-[#49bac9]/5 transition-all">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full bg-transparent p-4 text-sm outline-none resize-none text-neutral-700 min-h-25 placeholder:text-neutral-300"
                                placeholder="Share your thoughts..."
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between items-center p-2 border-t border-neutral-50">
                                <div className="h-8 w-8 rounded-full bg-linear-to-tr from-[#49bac9] to-[#3da6b5] flex items-center justify-center text-[10px] text-white font-bold shadow-md">A</div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="bg-[#49bac9] hover:bg-[#3da6b5] disabled:opacity-30 disabled:grayscale text-white text-[10px] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#49bac9]/20"
                                >
                                    {isSubmitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center py-12 gap-3">
                                    <Loader className="animate-spin text-[#49bac9]" size={24} />
                                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Loading Conversation...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-neutral-50 rounded-[2rem]">
                                    <p className="text-sm text-neutral-300 font-medium italic">No discussion yet.</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.comment_id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="h-9 w-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-bold shrink-0">A</div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <p className="text-xs font-bold text-neutral-800">Arham</p>
                                                <span className="h-1 w-1 bg-neutral-200 rounded-full" />
                                                <p className="text-[10px] font-medium text-neutral-300 uppercase tracking-tight">{formatDate(comment.createdAt)}</p>
                                            </div>
                                            <div className="bg-neutral-50/80 p-4 rounded-2xl rounded-tl-none border border-neutral-100/50">
                                                <p className="text-sm text-neutral-600 leading-relaxed">{comment.text}</p>
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