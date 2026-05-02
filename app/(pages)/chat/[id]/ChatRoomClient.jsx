"use client";

import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useMemo,
    useCallback,
    Fragment,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSocket } from "@/app/hooks/useSocket";
import { useUser } from "@/app/hooks/useUser";
import { useChatMessageNotifications } from "@/app/hooks/useChatMessageNotifications";
import {
    Send,
    Paperclip,
    Smile,
    Bell,
    BellOff,
    X,
    Clock,
    ChevronLeft,
    MessageSquare,
} from "lucide-react";
import { inter } from "@/app/fonts";
import gsap from "gsap";

const TEAL = "#0d9488";
const TEAL_SOFT = "#ccfbf1";

const EMOJI_GRID = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😍",
    "🥰",
    "😘",
    "😋",
    "😛",
    "🤗",
    "🤔",
    "😴",
    "😢",
    "😭",
    "😤",
    "🤯",
    "👍",
    "👎",
    "👏",
    "🙏",
    "💪",
    "🔥",
    "✨",
    "💯",
    "❤️",
    "🎉",
    "👋",
    "✅",
    "⭐",
    "📝",
    "📎",
    "☕",
    "🚀",
];

const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const parseMsgDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? null : d;
};

/** Full detail for tooltips / accessibility */
const formatFullTimestamp = (dateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return "—";
    return d.toLocaleString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

/** Single visible line: date context + time with seconds */
const formatMessageMetaLine = (dateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return "Just now";
    const now = new Date();
    const timePart = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    if (startOfDay(d) === startOfDay(now)) {
        return `Today · ${timePart}`;
    }
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (startOfDay(d) === startOfDay(y)) {
        return `Yesterday · ${timePart}`;
    }
    const datePart = d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    return `${datePart} · ${timePart}`;
};

const formatDayDividerOnly = (d) => {
    const now = new Date();
    if (startOfDay(d) === startOfDay(now)) return "Today";
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    if (startOfDay(d) === startOfDay(y)) return "Yesterday";
    return d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const getDayDividerLabel = (dateString, prevDateString) => {
    const d = parseMsgDate(dateString);
    if (!d) return null;
    if (!prevDateString) return formatDayDividerOnly(d);
    const prev = parseMsgDate(prevDateString);
    if (!prev || startOfDay(d) !== startOfDay(prev)) {
        return formatDayDividerOnly(d);
    }
    return null;
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
    const {
        toast,
        dismissToast,
        notifyIncomingMessage,
        permission: notifyPermission,
        requestBrowserPermission,
        notificationsSupported,
    } = useChatMessageNotifications(roomId, user?.user_id);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("messages");
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const emojiPopoverRef = useRef(null);
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
                queueMicrotask(() => notifyIncomingMessage(newMsg));
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
    }, [socket, roomId, notifyIncomingMessage]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    const insertEmoji = useCallback(
        (emoji) => {
            const el = inputRef.current;
            if (!el) {
                setInput((prev) => prev + emoji);
                return;
            }
            const start = el.selectionStart ?? input.length;
            const end = el.selectionEnd ?? start;
            const next =
                input.slice(0, start) + emoji + input.slice(end);
            setInput(next);
            requestAnimationFrame(() => {
                el.focus();
                const pos = start + emoji.length;
                el.setSelectionRange(pos, pos);
            });
        },
        [input]
    );

    useEffect(() => {
        if (activeTab !== "messages") return;
        const onKey = (e) => {
            if (e.repeat) return;
            const semicolon =
                e.code === "Semicolon" || e.key === ";" || e.key === "؛";
            if (!semicolon) return;
            const osMod =
                e.metaKey ||
                e.ctrlKey ||
                (typeof e.getModifierState === "function" &&
                    (e.getModifierState("OS") ||
                        e.getModifierState("Super")));
            if (!osMod) return;
            e.preventDefault();
            setEmojiOpen((open) => !open);
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [activeTab]);

    useEffect(() => {
        if (!emojiOpen) return;
        const onDown = (e) => {
            const t = e.target;
            if (emojiPopoverRef.current?.contains(t)) return;
            const smileBtn = t.closest?.("[data-emoji-toggle]");
            if (smileBtn) return;
            setEmojiOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [emojiOpen]);

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
        const items = list.querySelectorAll(
            ":scope > li[data-message-item]"
        );
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
        setEmojiOpen(false);
    };

    const canSend = Boolean(
        input.trim() && socket?.connected && user
    );

    return (
        <div
            className={`relative flex min-h-screen justify-center overflow-hidden bg-linear-to-b from-slate-100 via-slate-50 to-teal-50/30 px-3 py-4 sm:px-6 sm:py-8 ${inter.className}`}
        >
            <div
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_-8%,rgba(13,148,136,0.09),transparent)]"
                aria-hidden
            />
            <div className="relative flex h-[calc(100dvh-2rem)] w-full max-w-[440px] flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/95 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/50 backdrop-blur-sm sm:h-[min(736px,calc(100dvh-4rem))] sm:max-w-[460px]">
                <header className="shrink-0 border-b border-slate-100/90 bg-linear-to-b from-white via-white to-slate-50/40 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <Link
                            href="/chats"
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Back to messages"
                        >
                            <ChevronLeft size={22} strokeWidth={2} />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Team chat
                            </p>
                            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                                Group Chat
                            </h1>
                            {user && (
                                <p className="mt-1.5 text-[13px] leading-snug text-slate-500">
                                    Signed in as{" "}
                                    <span
                                        className="font-semibold capitalize text-teal-700"
                                        style={{ color: TEAL }}
                                    >
                                        {user.name?.trim() || "You"}
                                    </span>
                                </p>
                            )}
                        </div>
                        {notificationsSupported && (
                            <button
                                type="button"
                                onClick={() => requestBrowserPermission()}
                                className={`mt-0.5 shrink-0 rounded-xl p-2.5 shadow-sm transition-all ${
                                    notifyPermission === "granted"
                                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                                        : "bg-slate-100/90 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700"
                                }`}
                                title={
                                    notifyPermission === "granted"
                                        ? "Background notifications on"
                                        : notifyPermission === "denied"
                                          ? "Notifications blocked — enable in browser settings"
                                          : "Enable notifications when this tab is in the background"
                                }
                                aria-label={
                                    notifyPermission === "granted"
                                        ? "Notifications enabled"
                                        : "Enable notifications"
                                }
                            >
                                {notifyPermission === "granted" ? (
                                    <Bell size={20} strokeWidth={2} />
                                ) : (
                                    <BellOff size={20} strokeWidth={2} />
                                )}
                            </button>
                        )}
                    </div>
                    {toast && (
                        <div
                            role="status"
                            className="mt-3 flex gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-sm"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-teal-800">
                                    {toast.name}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-slate-600">
                                    {toast.preview}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={dismissToast}
                                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Dismiss notification"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    <div
                        className="mt-4 flex rounded-full bg-slate-200/60 p-1 shadow-inner"
                        role="tablist"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "messages"}
                            onClick={() => setActiveTab("messages")}
                            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                                activeTab === "messages"
                                    ? "text-teal-900 shadow-sm ring-1 ring-slate-200/60"
                                    : "text-slate-500 hover:text-slate-700"
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
                                    ? "text-teal-900 shadow-sm ring-1 ring-slate-200/60"
                                    : "text-slate-500 hover:text-slate-700"
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
                        <div className="min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-slate-50/90 to-white px-3 pb-2 sm:px-4 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                            {messages.length === 0 ? (
                                <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100">
                                        <MessageSquare
                                            className="text-teal-600"
                                            size={26}
                                            strokeWidth={1.75}
                                        />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">
                                        No messages yet
                                    </p>
                                    <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-slate-400">
                                        Say hello — your team will see messages
                                        here in real time.
                                    </p>
                                </div>
                            ) : (
                                <ul
                                    ref={messagesListRef}
                                    className="flex flex-col gap-5 py-2"
                                >
                                    {messages.map((msg, index) => {
                                        const isOwn =
                                            msg.user_id === user?.user_id;
                                        const key =
                                            msg.id ??
                                            `${msg.room_id}-${msg.createdAt}-${msg.text?.slice(0, 20)}`;
                                        const displayName = isOwn
                                            ? "You"
                                            : msg.sender?.name || "Team member";
                                        const metaLine = formatMessageMetaLine(
                                            msg.createdAt
                                        );
                                        const fullTs = formatFullTimestamp(
                                            msg.createdAt
                                        );
                                        const prevMsg = messages[index - 1];
                                        const dayLabel = getDayDividerLabel(
                                            msg.createdAt,
                                            prevMsg?.createdAt
                                        );

                                        return (
                                            <Fragment key={key}>
                                                {dayLabel && (
                                                    <li
                                                        className="flex list-none justify-center py-1"
                                                        aria-hidden
                                                    >
                                                        <span className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-slate-500 shadow-sm shadow-slate-200/30">
                                                            {dayLabel}
                                                        </span>
                                                    </li>
                                                )}
                                                <li
                                                    data-message-item
                                                    className={`flex gap-3 ${
                                                        isOwn
                                                            ? "flex-row-reverse"
                                                            : "flex-row"
                                                    }`}
                                                >
                                                    {!isOwn && (
                                                        <div className="mt-7 h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md shadow-slate-200/50">
                                                            <img
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user_id}`}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`flex min-w-0 max-w-[88%] flex-col gap-1.5 ${
                                                            isOwn
                                                                ? "items-end pl-6"
                                                                : "items-start pr-4"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`px-1 text-[12px] font-semibold tracking-tight text-slate-600 ${
                                                                isOwn
                                                                    ? "text-right"
                                                                    : "text-left"
                                                            }`}
                                                        >
                                                            {displayName}
                                                        </span>
                                                        <div
                                                            className={`rounded-[22px] px-4 py-3 text-[15px] leading-relaxed text-slate-800 antialiased wrap-anywhere ${
                                                                isOwn
                                                                    ? "rounded-br-lg bg-linear-to-br from-violet-100/90 to-indigo-100/80 text-slate-900 shadow-sm ring-1 ring-violet-200/40"
                                                                    : "rounded-bl-lg border border-slate-200/70 bg-white shadow-md shadow-slate-200/25 ring-1 ring-white/80"
                                                            }`}
                                                        >
                                                            {renderWithMentions(
                                                                msg.text
                                                            )}
                                                        </div>
                                                        <time
                                                            dateTime={
                                                                msg.createdAt ||
                                                                undefined
                                                            }
                                                            title={fullTs}
                                                            className={`flex items-center gap-1 px-1 text-[11px] tabular-nums leading-none text-slate-400 ${
                                                                isOwn
                                                                    ? "flex-row-reverse text-right"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <Clock
                                                                className="shrink-0 opacity-70"
                                                                size={12}
                                                                strokeWidth={2}
                                                                aria-hidden
                                                            />
                                                            <span>{metaLine}</span>
                                                        </time>
                                                    </div>
                                                </li>
                                            </Fragment>
                                        );
                                    })}
                                </ul>
                            )}
                            <div ref={scrollRef} className="h-2 shrink-0" />
                        </div>

                        <div className="shrink-0 border-t border-slate-100/90 bg-linear-to-t from-slate-50/95 to-white px-3 pb-5 pt-4 sm:px-4">
                            <form
                                onSubmit={handleSend}
                                className="flex items-end gap-3"
                            >
                                <div className="relative min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white py-1.5 pl-4 pr-2 shadow-inner shadow-slate-100/80 ring-1 ring-slate-100/50 transition-all focus-within:border-teal-300/60 focus-within:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus-within:ring-teal-100">
                                    {emojiOpen && (
                                        <div
                                            ref={emojiPopoverRef}
                                            className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl shadow-slate-300/30 ring-1 ring-slate-100/80 backdrop-blur-md"
                                            role="dialog"
                                            aria-label="Emoji picker"
                                        >
                                            <div className="max-h-44 overflow-y-auto [scrollbar-width:thin]">
                                                <div className="grid grid-cols-8 gap-0.5 p-1">
                                                    {EMOJI_GRID.map((em) => (
                                                        <button
                                                            key={em}
                                                            type="button"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg leading-none transition-colors hover:bg-[#f1f5f9] active:scale-95"
                                                            onClick={() => {
                                                                insertEmoji(
                                                                    em
                                                                );
                                                                setEmojiOpen(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            {em}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="border-t border-slate-100 bg-slate-50/50 px-2.5 py-2 text-[10px] leading-snug text-slate-400">
                                                <span className="font-semibold text-slate-500">
                                                    ⊞ + ;
                                                </span>{" "}
                                                or{" "}
                                                <span className="font-semibold text-slate-500">
                                                    Ctrl + ;
                                                </span>{" "}
                                                · smile button
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) =>
                                                setInput(e.target.value)
                                            }
                                            placeholder="Message the team…"
                                            className="min-w-0 flex-1 bg-transparent py-3 pr-2 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                                            autoComplete="off"
                                        />
                                        <div className="flex shrink-0 items-center gap-0.5 pr-1">
                                            <button
                                                type="button"
                                                data-emoji-toggle
                                                className={`rounded-xl p-2 transition-colors ${
                                                    emojiOpen
                                                        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                                                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                }`}
                                                aria-label="Emoji picker"
                                                aria-expanded={emojiOpen}
                                                onClick={() =>
                                                    setEmojiOpen((o) => !o)
                                                }
                                            >
                                                <Smile
                                                    size={20}
                                                    strokeWidth={1.75}
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                                    className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/35 transition-all hover:from-teal-600 hover:to-emerald-700 hover:shadow-teal-500/45 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:from-teal-500 disabled:hover:to-emerald-600"
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
                        className="min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-slate-50/90 to-white px-4 pb-8 pt-2"
                    >
                        <p className="mb-4 px-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            In this room · {participants.length}
                        </p>
                        <ul
                            ref={participantsListRef}
                            className="flex flex-col gap-2.5"
                        >
                            {participants.map((p) => (
                                <li
                                    key={p.user_id}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3.5 shadow-sm shadow-slate-200/30 ring-1 ring-white/60"
                                >
                                    <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-slate-100 shadow-sm">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold capitalize text-slate-800">
                                            {p.name}
                                            {p.isSelf && (
                                                <span
                                                    className="ml-2 text-xs font-medium text-teal-600"
                                                    style={{ color: TEAL }}
                                                >
                                                    You
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {participants.length === 0 && (
                            <p className="py-12 text-center text-sm leading-relaxed text-slate-400">
                                No one here yet. Send a message to appear in
                                this list.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
