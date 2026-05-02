"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useUser } from "@/app/hooks/useUser";
import {
    Plus,
    MessageSquare,
    Users,
    User,
    Trash2,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { inter } from "@/app/fonts";

const fetcher = (url) => fetch(url).then((res) => res.json());

const AllChatsPage = () => {
    const { user } = useUser();
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { data, error, isLoading, mutate } = useSWR("/api/chat/rooms", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    const handleCreateChat = async () => {
        const roomName = prompt("Enter chat room name:");
        if (!roomName?.trim() || !user) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/chat/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: roomName.trim(),
                    user_id: user.user_id,
                }),
            });

            const result = await res.json();
            if (result.success) {
                mutate();
                alert("Chat room created.");
            } else {
                alert(result.message || "Failed to create room");
            }
        } catch (err) {
            console.error("Create Room Error:", err);
            alert("Something went wrong.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteRoom = async (roomId, roomName) => {
        if (
            !confirm(
                `Delete “${roomName}”? This cannot be undone.`
            )
        ) {
            return;
        }

        setDeletingId(roomId);
        try {
            const res = await fetch(`/api/chat/rooms/${roomId}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result.success) {
                mutate();
                alert("Room deleted.");
            } else {
                alert(result.message || "Failed to delete room");
            }
        } catch (err) {
            console.error("Delete Room Error:", err);
            alert("Something went wrong while deleting.");
        } finally {
            setDeletingId(null);
        }
    };

    if (error) {
        return (
            <div
                className={`flex min-h-screen items-center justify-center bg-slate-50 px-6 ${inter.className}`}
            >
                <div className="max-w-md rounded-3xl border border-red-100 bg-white px-8 py-10 text-center shadow-xl shadow-slate-200/50">
                    <p className="text-sm font-medium text-red-600">
                        Couldn’t load conversations
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Check your connection and try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen bg-linear-to-b from-slate-100 via-slate-50 to-white ${inter.className}`}
        >
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.08),transparent)]" />

            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
                <div className="relative mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500 to-emerald-700 text-white shadow-lg shadow-teal-500/25">
                            <MessageSquare size={22} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                Messages
                            </h1>
                            <p className="text-sm text-slate-500">
                                Team rooms · encrypted in transit
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateChat}
                        disabled={isCreating}
                        className="flex shrink-0 items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60 sm:px-5"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span className="hidden sm:inline">
                            {isCreating ? "Creating…" : "New room"}
                        </span>
                    </button>
                </div>
            </header>

            <main className="relative mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-8">
                {!isLoading && data?.rooms?.length > 0 && (
                    <div className="mb-4 flex items-center justify-between px-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Your rooms
                        </span>
                        <span className="text-xs text-slate-400">
                            {data.rooms.length}{" "}
                            {data.rooms.length === 1 ? "room" : "rooms"}
                        </span>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-100/80 bg-white/90 p-5 shadow-sm"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-slate-200/80" />
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-4 w-2/3 rounded-lg bg-slate-200/80" />
                                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {data?.rooms?.map((room) => (
                            <li key={room.room_id}>
                                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-sm shadow-slate-200/40 transition hover:border-teal-200/80 hover:shadow-md hover:shadow-teal-500/5">
                                    <Link
                                        href={`/chat/${room.room_id}`}
                                        className="flex items-center gap-4 p-4 sm:p-5"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-teal-50 to-emerald-50 text-teal-700 ring-1 ring-teal-100/80 transition group-hover:from-teal-100 group-hover:to-emerald-100">
                                            <MessageSquare
                                                size={22}
                                                strokeWidth={2}
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                                                {room.name}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Users
                                                        size={13}
                                                        className="text-slate-400"
                                                    />
                                                    Team discussion
                                                </span>
                                                <span className="hidden text-slate-300 sm:inline">
                                                    ·
                                                </span>
                                                <span className="hidden items-center gap-1 sm:inline-flex">
                                                    <User
                                                        size={13}
                                                        className="text-slate-400"
                                                    />
                                                    <span className="truncate">
                                                        {room.creator?.name ||
                                                            "System"}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden shrink-0 text-right sm:block">
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Created
                                            </p>
                                            <p className="mt-0.5 text-sm tabular-nums text-slate-600">
                                                {room.created_at
                                                    ? new Date(
                                                          room.created_at
                                                      ).toLocaleDateString(
                                                          "en-GB",
                                                          {
                                                              day: "numeric",
                                                              month: "short",
                                                          }
                                                      )
                                                    : "—"}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600"
                                            size={22}
                                            strokeWidth={2}
                                        />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteRoom(
                                                room.room_id,
                                                room.name
                                            );
                                        }}
                                        disabled={deletingId === room.room_id}
                                        className="absolute right-14 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-40"
                                        title="Delete room"
                                        aria-label="Delete room"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {data?.rooms?.length === 0 && !isLoading && (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-8 py-16 text-center shadow-inner shadow-slate-100/50">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-teal-50 to-slate-50 ring-1 ring-teal-100/60">
                            <Sparkles
                                className="text-teal-600"
                                size={28}
                                strokeWidth={1.75}
                            />
                        </div>
                        <h3 className="mt-6 text-lg font-semibold text-slate-800">
                            Start your first room
                        </h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                            Create a space for your team to chat in real time.
                        </p>
                        <button
                            type="button"
                            onClick={handleCreateChat}
                            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            New chat room
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllChatsPage;
