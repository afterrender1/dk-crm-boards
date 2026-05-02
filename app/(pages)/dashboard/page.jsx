"use client";

import ActiveStrip from "@/app/component/dashboard-component/ActiveStrip";
import CircleCharts from "@/app/component/dashboard-component/CircleCharts";
import DataCharts from "@/app/component/dashboard-component/DataCharts";
import Link from "next/link";
import React from "react";
import { useUser } from "@/app/hooks/useUser";
import { inter } from "@/app/fonts";
import {
    LayoutGrid,
    MessageSquare,
    Users,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";

const quickLinks = [
    {
        href: "/boards",
        label: "Boards",
        description: "Projects & tasks",
        icon: LayoutGrid,
    },
    {
        href: "/chats",
        label: "Messages",
        description: "Team chat",
        icon: MessageSquare,
    },
    {
        href: "/clients",
        label: "Clients",
        description: "Directory",
        icon: Users,
    },
];

export default function DashboardPage() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div
                className={`min-h-0 w-full min-w-0 max-w-full overflow-x-clip bg-slate-50 ${inter.className}`}
            >
                <div
                    className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.06),transparent)]"
                    aria-hidden
                />
                <div className="relative mx-auto max-w-[1700px] px-3 py-8 sm:px-5 sm:py-10 md:px-6 lg:px-8">
                    <div className="mb-10 h-36 animate-pulse rounded-2xl bg-white/80 ring-1 ring-slate-200/60" />
                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-24 animate-pulse rounded-xl bg-white/80 ring-1 ring-slate-200/50"
                            />
                        ))}
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-96 animate-pulse rounded-2xl bg-white/80 ring-1 ring-slate-200/50 lg:col-span-2" />
                        <div className="h-96 animate-pulse rounded-2xl bg-white/80 ring-1 ring-slate-200/50" />
                    </div>
                </div>
            </div>
        );
    }

    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div
            className={`min-h-0 w-full min-w-0 max-w-full overflow-x-clip bg-linear-to-b from-slate-50 via-white to-slate-50/80 ${inter.className}`}
        >
            <div
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(13,148,136,0.07),transparent)]"
                aria-hidden
            />

            <div className="relative mx-auto max-w-[1700px] px-3 pb-10 pt-4 sm:px-5 sm:pb-14 sm:pt-6 md:px-6 lg:px-8">
                {/* Hero */}
                <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-800">
                            <Sparkles
                                className="h-3.5 w-3.5 text-teal-600"
                                strokeWidth={2}
                            />
                            Overview
                        </div>
                        <h1 className="mt-3 wrap-break-word text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                            {user ? (
                                <>
                                    Hello,{" "}
                                    <span className="bg-linear-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent capitalize">
                                        {user.name?.trim() || "there"}
                                    </span>
                                </>
                            ) : (
                                "Welcome"
                            )}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                            {user
                                ? "Here’s a snapshot of your workspace — clients, pipeline, and activity at a glance."
                                : "Sign in to unlock your dashboard and see live client metrics."}
                        </p>
                        <p className="mt-3 text-xs font-medium text-slate-400 sm:text-sm">
                            {today}
                        </p>
                    </div>

                    {user ? (
                        <div className="flex w-full shrink-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm sm:w-auto sm:max-w-sm">
                            <img
                                src={
                                    user.image ||
                                    "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                                }
                                alt=""
                                className="h-11 w-11 rounded-xl object-cover ring-2 ring-slate-100"
                            />
                            <div className="min-w-0 text-left">
                                <p className="truncate text-sm font-semibold text-slate-900 capitalize">
                                    {user.name || "Member"}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                    {user.email || "Signed in"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 sm:w-auto"
                        >
                            Sign in
                        </Link>
                    )}
                </header>

                {/* Quick links */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
                    {quickLinks.map(({ href, label, description, icon: Icon }) => (
                        <Link
                            key={href}
                            href={user ? href : "/login"}
                            className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm shadow-slate-200/30 ring-1 ring-white/60 transition hover:border-teal-200/80 hover:shadow-md hover:shadow-teal-500/5 sm:gap-4 sm:p-4"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-50 to-emerald-50 text-teal-700 ring-1 ring-teal-100/80 transition group-hover:from-teal-100 group-hover:to-emerald-100">
                                <Icon size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                                <p className="font-semibold text-slate-900">
                                    {label}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {description}
                                </p>
                            </div>
                            <ArrowUpRight
                                className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600"
                                strokeWidth={2}
                            />
                        </Link>
                    ))}
                </div>

                {/* KPI strip — only meaningful when logged in; still show shell for guests */}
                <div className="mb-8">
                    {user ? (
                        <ActiveStrip />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center">
                            <p className="text-sm font-medium text-slate-600">
                                Client metrics appear after you sign in.
                            </p>
                            <Link
                                href="/login"
                                className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:underline"
                            >
                                Go to login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="min-h-0 min-w-0 lg:col-span-2">
                        <DataCharts />
                    </div>
                    <div className="min-h-0 min-w-0 lg:col-span-1">
                        {user ? (
                            <CircleCharts />
                        ) : (
                            <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
                                Lead distribution unlocks when you’re signed in.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
