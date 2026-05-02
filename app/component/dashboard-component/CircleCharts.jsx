"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import useSWR from "swr";
import { inter } from "@/app/fonts";

const fetcher = (url) => fetch(url).then((res) => res.json());

const COLORS = ["#0d9488", "#f59e0b", "#f43f5e", "#94a3b8"];

export default function CircleCharts() {
    const { data: clientsData = [], isLoading } = useSWR("/api/client", fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000,
        focusThrottleInterval: 300000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        fallbackData: [],
    });

    const list = Array.isArray(clientsData) ? clientsData : [];

    const statusDistribution = useMemo(() => {
        if (list.length === 0) {
            return [
                { name: "Active", value: 0 },
                { name: "Pending", value: 0 },
                { name: "Closed", value: 0 },
            ];
        }
        const counts = {
            Active: list.filter((c) => c.status === "Active").length,
            Pending: list.filter((c) => c.status === "Pending").length,
            Closed: list.filter((c) => c.status === "Closed").length,
        };
        return [
            { name: "Active", value: counts.Active },
            { name: "Pending", value: counts.Pending },
            { name: "Closed", value: counts.Closed },
        ];
    }, [list]);

    if (isLoading) {
        return (
            <div
                className={`flex min-h-[340px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 ring-1 ring-white/80 ${inter.className}`}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Loading chart
                    </p>
                </div>
            </div>
        );
    }

    const hasData = list.length > 0;

    return (
        <div
            className={`flex min-h-[320px] w-full min-w-0 max-w-full flex-col overflow-x-clip overflow-y-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm sm:min-h-[360px] md:min-h-[380px] ${inter.className}`}
        >
            <div className="border-b border-slate-100/90 px-3 py-3 sm:px-6 sm:py-5">
                <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    Lead distribution
                </h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Status breakdown from your client records
                </p>
            </div>

            <div className="relative min-h-[220px] flex-1 px-2 pb-4 pt-2 sm:min-h-[240px]">
                {!hasData ? (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm font-medium text-slate-600">
                            No clients yet
                        </p>
                        <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-400">
                            Add clients to see how leads split across statuses.
                        </p>
                    </div>
                ) : (
                    <div className="relative mx-auto h-[220px] w-full max-w-[280px] min-w-0 sm:h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="58%"
                                    outerRadius="82%"
                                    paddingAngle={3}
                                    stroke="none"
                                    cornerRadius={4}
                                >
                                    {statusDistribution.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                COLORS[index % COLORS.length]
                                            }
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor:
                                            "rgba(255,255,255,0.96)",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow:
                                            "0 18px 40px -12px rgb(15 23 42 / 0.15)",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-semibold tabular-nums text-slate-900">
                                {list.length}
                            </span>
                            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                Total
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {hasData && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-slate-100/90 px-4 py-3 sm:px-6">
                    {statusDistribution.map((item, index) => (
                        <div
                            key={item.name}
                            className="flex items-center gap-2"
                        >
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        COLORS[index % COLORS.length],
                                }}
                            />
                            <span className="text-xs font-medium text-slate-600">
                                {item.name}
                                <span className="ml-1 tabular-nums text-slate-400">
                                    ({item.value})
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
