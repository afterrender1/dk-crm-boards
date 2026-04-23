"use client"
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Calendar, Tag, Send, Loader } from 'lucide-react';

const CommentSidebar = ({ card, isOpen, onClose }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch comments when card changes
    useEffect(() => {
        if (isOpen && card?.card_id) {
            fetchComments();
        }
    }, [isOpen, card?.card_id]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/cards/${card.card_id}/comments`);
            const data = await res.json();
            if (data.success) {
                setComments(data.comments || []);
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

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

            const data = await res.json();
            if (data.success) {
                setCommentText('');
                // Add new comment to list
                setComments(prev => [data.newComment, ...prev]);
            } else {
                alert(data.message || 'Failed to post comment');
            }
        } catch (err) {
            console.error('Error posting comment:', err);
            alert('Failed to post comment');
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
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (!card) return null;

    return (
        <>
            {/* Background Overlay (Click to close) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed top-0 right-0 h-screen w-112.5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-neutral-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-8 border-b border-neutral-100 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#49bac9] uppercase tracking-widest">
                            <Tag size={12} /> {card.priority} Priority
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900">{card.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-8 overflow-y-auto h-[calc(100vh-120px)] custom-scrollbar">
                    {/* Description */}
                    <div className="mb-10">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Description</h4>
                        <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                            {card.description || "No description provided for this task."}
                        </p>
                    </div>

                    {/* Comments Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <MessageSquare size={16} className="text-neutral-400" />
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Discussion ({comments.length})</h4>
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handlePostComment} className="flex gap-3 mb-8 sticky bottom-0 bg-white">
                            <div className="h-8 w-8 rounded-full bg-[#49bac9] flex items-center justify-center text-[10px] text-white font-bold shrink-0">A</div>
                            <div className="flex-1 space-y-2">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm outline-none focus:border-[#49bac9] transition-all resize-none"
                                    placeholder="Write a comment..."
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="bg-[#49bac9] hover:bg-[#3da6b5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size={14} className="animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            Post Comment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8">
                                    <Loader className="inline-block animate-spin text-neutral-400" size={20} />
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-sm text-neutral-400 text-center py-8">No comments yet. Be the first to comment!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.comment_id} className="flex gap-3 pb-4 border-b border-neutral-100 last:border-b-0">
                                        <div className="h-8 w-8 rounded-full bg-[#49bac9] flex items-center justify-center text-[10px] text-white font-bold shrink-0 flex-none">A</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-xs font-semibold text-neutral-900">You</p>
                                                    <p className="text-[10px] text-neutral-400">{formatDate(comment.createdAt)}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-600 leading-relaxed mt-2 bg-neutral-50 p-3 rounded-lg">
                                                {comment.text}
                                            </p>
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