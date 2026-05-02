"use client";

import dynamic from "next/dynamic";

const ChatRoomClient = dynamic(() => import("./ChatRoomClient"), {
    ssr: false,
    loading: () => (
        <div
            className="flex min-h-screen items-center justify-center bg-[#eef0f3]"
            aria-busy="true"
            aria-label="Loading chat"
        >
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#0d9488] border-t-transparent" />
        </div>
    ),
});

export default function ChatPage() {
    return <ChatRoomClient />;
}
