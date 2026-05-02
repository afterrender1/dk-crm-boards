"use client";

import dynamic from "next/dynamic";

const ChatRoomClient = dynamic(() => import("./ChatRoomClient"), {
    ssr: false,
    loading: () => (
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-slate-100 via-slate-50 to-teal-50/30"
            aria-busy="true"
            aria-label="Loading chat"
        >
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_-8%,rgba(13,148,136,0.09),transparent)]"
                aria-hidden
            />
            <div className="relative flex flex-col items-center gap-3">
                <div className="h-11 w-11 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                <p className="text-xs font-medium text-slate-500">
                    Opening conversation…
                </p>
            </div>
        </div>
    ),
});

export default function ChatPage() {
    return <ChatRoomClient />;
}
