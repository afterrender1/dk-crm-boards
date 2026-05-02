"use client";

import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
} from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/app/hooks/useSocket";
import { useUser } from "@/app/hooks/useUser";
import { Send, Paperclip, Smile } from "lucide-react";
import { inter } from "@/app/fonts";
import gsap from "gsap";

const TEAL = "#0d9488";
const TEAL_SOFT = "#ccfbf1";

const formatMessageTime = (dateString) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

const renderWithMentions = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(@[\w.-]+)/g);
    return parts.map((part, i) =>
        part.startsWith("@") ? (
            <span key={i} className="font-medium" style={{ color: TEAL }}>
                {part}
            </span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

export default function ChatRoomClient() {
    const { id: roomId } = useParams();
    const { user } = useUser();
    const socket = useSocket();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState("messages");
    const scrollRef = useRef(null);
    const messagesPanelRef = useRef(null);
    const participantsPanelRef = useRef(null);
    const messagesListRef = useRef(null);
    const participantsListRef = useRef(null);
    const prevMessageCountRef = useRef(0);
    const prevParticipantsKeyRef = useRef("");
    const participantsTabPrimedRef = useRef(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/chat/history?room_id=${roomId}`);
                const data = await res.json();
                if (data.success) setMessages(data.history || []);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        if (roomId) fetchHistory();
    }, [roomId]);

    useEffect(() => {
        if (!socket || !roomId) return;

        const room = String(roomId);

        const onReceive = (newMsg) => {
            if (!newMsg || String(newMsg.room_id) !== room) return;
            setMessages((prev) => {
                const id = newMsg.id;
                if (id != null && prev.some((m) => m.id === id)) return prev;
                return [...prev, newMsg];
            });
        };

        const joinRoom = () => {
            socket.emit("join_room", room);
        };

        joinRoom();
        socket.on("connect", joinRoom);
        socket.on("receive_msg", onReceive);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("receive_msg", onReceive);
            socket.emit("leave_room", room);
        };
    }, [socket, roomId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    const participants = useMemo(() => {
        const map = new Map();
        if (user?.user_id != null) {
            map.set(user.user_id, {
                user_id: user.user_id,
                name: user.name || "You",
                isSelf: true,
            });
        }
        for (const m of messages) {
            const uid = m.user_id;
            if (uid == null) continue;
            if (!map.has(uid)) {
                map.set(uid, {
                    user_id: uid,
                    name: m.sender?.name || `Member ${uid}`,
                    isSelf: uid === user?.user_id,
                });
            }
        }
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [messages, user]);

    const participantsKey = useMemo(
        () => participants.map((p) => p.user_id).join(","),
        [participants]
    );

    useLayoutEffect(() => {
        const el =
            activeTab === "messages"
                ? messagesPanelRef.current
                : participantsPanelRef.current;
        if (!el) return;
        gsap.fromTo(
            el,
            {
                opacity: 0,
                y: 14,
                filter: "blur(12px)",
            },
            {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power3.out",
                clearProps: "filter",
            }
        );
    }, [activeTab]);

    useLayoutEffect(() => {
        if (activeTab !== "messages") return;
        const list = messagesListRef.current;
        if (!list) return;
        const items = list.querySelectorAll(":scope > li");
        const n = items.length;
        if (n === 0) {
            prevMessageCountRef.current = 0;
            return;
        }

        const prev = prevMessageCountRef.current;
        if (n > prev) {
            if (prev === 0) {
                gsap.fromTo(
                    items,
                    {
                        opacity: 0,
                        y: 22,
                        filter: "blur(8px)",
                    },
                    {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        duration: 0.42,
                        stagger: 0.055,
                        ease: "power2.out",
                        clearProps: "filter",
                    }
                );
            } else {
                gsap.fromTo(
                    items[n - 1],
                    {
                        opacity: 0,
                        y: 16,
                        scale: 0.97,
                        filter: "blur(10px)",
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        duration: 0.45,
                        ease: "back.out(1.35)",
                        clearProps: "filter",
                    }
                );
            }
        }
        prevMessageCountRef.current = n;
    }, [messages, activeTab]);

    useLayoutEffect(() => {
        if (activeTab !== "participants") {
            participantsTabPrimedRef.current = false;
            return;
        }

        const list = participantsListRef.current;
        if (!list) return;
        const items = list.querySelectorAll(":scope > li");
        if (items.length === 0) return;

        const keyChanged = prevParticipantsKeyRef.current !== participantsKey;
        const shouldAnimate =
            !participantsTabPrimedRef.current || keyChanged;

        prevParticipantsKeyRef.current = participantsKey;
        participantsTabPrimedRef.current = true;

        if (!shouldAnimate) return;

        gsap.fromTo(
            items,
            {
                opacity: 0,
                x: -16,
                filter: "blur(6px)",
            },
            {
                opacity: 1,
                x: 0,
                filter: "blur(0px)",
                duration: 0.4,
                stagger: 0.075,
                ease: "power2.out",
                clearProps: "filter",
            }
        );
    }, [activeTab, participantsKey]);

    const handleSend = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !socket || !user) return;
        if (!socket.connected) return;

        socket.emit("send_msg", {
            room_id: String(roomId),
            user_id: user.user_id,
            text,
        });
        setInput("");
    };

    const canSend = Boolean(
        input.trim() && socket?.connected && user
    );

    return (
        <div
            className={`flex min-h-screen justify-center bg-[#eef0f3] px-3 py-4 sm:px-6 sm:py-8 ${inter.className}`}
        >
            <div className="flex h-[calc(100dvh-2rem)] sm:h-[min(720px,calc(100dvh-4rem))] w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.12)] sm:max-w-[480px]">
                <header className="shrink-0 px-5 pt-5 pb-4">
                    <h1 className="text-lg font-semibold tracking-tight text-[#1e293b] sm:text-xl">
                        Group Chat
                    </h1>
                    {user && (
                        <p className="mt-1.5 text-[13px] leading-snug text-[#64748b]">
                            You are chatting as{" "}
                            <span
                                className="font-semibold text-[#134e4a]"
                                style={{ color: TEAL }}
                            >
                                {user.name?.trim() || "You"}
                            </span>
                        </p>
                    )}
                    <div
                        className="mt-4 flex rounded-full bg-[#e8eaee] p-1"
                        role="tablist"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "messages"}
                            onClick={() => setActiveTab("messages")}
                            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                                activeTab === "messages"
                                    ? "text-[#134e4a] shadow-sm"
                                    : "text-[#64748b] hover:text-[#475569]"
                            }`}
                            style={
                                activeTab === "messages"
                                    ? { backgroundColor: TEAL_SOFT }
                                    : undefined
                            }
                        >
                            Messages
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "participants"}
                            onClick={() => setActiveTab("participants")}
                            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                                activeTab === "participants"
                                    ? "text-[#134e4a] shadow-sm"
                                    : "text-[#64748b] hover:text-[#475569]"
                            }`}
                            style={
                                activeTab === "participants"
                                    ? { backgroundColor: TEAL_SOFT }
                                    : undefined
                            }
                        >
                            Participants
                        </button>
                    </div>
                </header>

                {activeTab === "messages" ? (
                    <div
                        ref={messagesPanelRef}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                            {messages.length === 0 ? (
                                <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-6 text-center">
                                    <p className="text-sm font-medium text-[#94a3b8]">
                                        No messages yet
                                    </p>
                                    <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-[#cbd5e1]">
                                        Start the conversation — say hello to the
                                        team.
                                    </p>
                                </div>
                            ) : (
                                <ul
                                    ref={messagesListRef}
                                    className="flex flex-col gap-7 py-2"
                                >
                                    {messages.map((msg) => {
                                        const isOwn =
                                            msg.user_id === user?.user_id;
                                        const key =
                                            msg.id ??
                                            `${msg.room_id}-${msg.createdAt}-${msg.text?.slice(0, 20)}`;
                                        const displayName = isOwn
                                            ? "You"
                                            : msg.sender?.name || "Team member";
                                        const timeStr = formatMessageTime(
                                            msg.createdAt
                                        );

                                        return (
                                            <li
                                                key={key}
                                                className={`flex gap-3 ${
                                                    isOwn
                                                        ? "flex-row-reverse"
                                                        : "flex-row"
                                                }`}
                                            >
                                                {!isOwn && (
                                                    <div className="mt-6 h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_id}`}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div
                                                    className={`flex min-w-0 max-w-[85%] flex-col ${
                                                        isOwn
                                                            ? "items-end pl-8"
                                                            : "items-start pr-4"
                                                    }`}
                                                >
                                                    <p
                                                        className={`mb-2 text-[11px] font-medium leading-none text-[#475569] sm:text-xs ${
                                                            isOwn
                                                                ? "text-right"
                                                                : "text-left"
                                                        }`}
                                                    >
                                                        {displayName}
                                                        <span className="mx-1.5 font-normal text-[#94a3b8]">
                                                            ·
                                                        </span>
                                                        <span className="font-normal text-[#64748b]">
                                                            {timeStr}
                                                        </span>
                                                    </p>
                                                    <div
                                                        className={`rounded-[20px] px-4 py-3 text-[15px] leading-relaxed text-[#1e293b] wrap-anywhere ${
                                                            isOwn
                                                                ? "rounded-br-md bg-[#e8e4f0]"
                                                                : "rounded-bl-md border border-[#f1f5f9] bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]"
                                                        }`}
                                                    >
                                                        {renderWithMentions(
                                                            msg.text
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            <div ref={scrollRef} className="h-2 shrink-0" />
                        </div>

                        <div className="shrink-0 border-t border-[#f1f5f9] bg-[#fafbfc] px-4 pb-5 pt-4">
                            <form
                                onSubmit={handleSend}
                                className="flex items-end gap-3"
                            >
                                <div className="relative min-w-0 flex-1 rounded-[22px] border border-[#e2e8f0] bg-white py-1 pl-4 pr-2 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] transition-shadow focus-within:border-[#99f6e4] focus-within:shadow-[0_4px_20px_-6px_rgba(13,148,136,0.2)]">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) =>
                                                setInput(e.target.value)
                                            }
                                            placeholder="Write your message..."
                                            className="min-w-0 flex-1 bg-transparent py-3 pr-2 text-[15px] text-[#334155] outline-none placeholder:text-[#94a3b8]"
                                            autoComplete="off"
                                        />
                                        <div className="flex shrink-0 items-center gap-0.5 pr-1">
                                            <button
                                                type="button"
                                                className="rounded-xl p-2 text-[#94a3b8] transition-colors hover:bg-[#f8fafc] hover:text-[#64748b]"
                                                aria-label="Emoji"
                                            >
                                                <Smile
                                                    size={20}
                                                    strokeWidth={1.75}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-xl p-2 text-[#94a3b8] transition-colors hover:bg-[#f8fafc] hover:text-[#64748b]"
                                                aria-label="Attach file"
                                            >
                                                <Paperclip
                                                    size={20}
                                                    strokeWidth={1.75}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!canSend}
                                    className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_4px_14px_-3px_rgba(13,148,136,0.55)] transition-all hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                                    style={{ backgroundColor: TEAL }}
                                    aria-label="Send message"
                                >
                                    <Send
                                        size={20}
                                        className="-ml-0.5 translate-x-px"
                                    />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div
                        ref={participantsPanelRef}
                        className="min-h-0 flex-1 overflow-y-auto px-4 pb-6"
                    >
                        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                            In this room ({participants.length})
                        </p>
                        <ul
                            ref={participantsListRef}
                            className="flex flex-col gap-2"
                        >
                            {participants.map((p) => (
                                <li
                                    key={p.user_id}
                                    className="flex items-center gap-3 rounded-2xl border border-[#f1f5f9] bg-white px-4 py-3 "
                                >
                                    <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#f8fafc]">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm capitalize font-semibold text-[#1e293b]">
                                            {p.name}
                                            {p.isSelf && (
                                                <span
                                                    className="ml-2 text-xs font-normal"
                                                    style={{ color: TEAL }}
                                                >
                                                    (you)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {participants.length === 0 && (
                            <p className="py-8 text-center text-sm text-[#94a3b8]">
                                No participants yet. Send a message to appear
                                here.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
