"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { inter } from "@/app/fonts";

const data = [
    { name: "Jan", uv: 4000, pv: 2400 },
    { name: "Feb", uv: 3000, pv: 1398 },
    { name: "Mar", uv: 2000, pv: 9800 },
    { name: "Apr", uv: 2780, pv: 3908 },
    { name: "May", uv: 1890, pv: 4800 },
    { name: "Jun", uv: 2390, pv: 3800 },
    { name: "Jul", uv: 3490, pv: 4300 },
];

export default function DataCharts() {
    return (
        <div
            className={`flex min-h-[320px] w-full min-w-0 max-w-full flex-col overflow-x-clip overflow-y-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 ring-1 ring-white/80 backdrop-blur-sm sm:min-h-[360px] md:min-h-[380px] ${inter.className}`}
        >
            <div className="border-b border-slate-100/90 px-3 py-3 sm:px-6 sm:py-5">
                <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    Revenue overview
                </h3>
                <p className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">
                    Sample trend data — connect billing for live revenue.
                </p>
            </div>
            <div className="min-h-0 w-full min-w-0 flex-1 px-1 pb-3 pt-1 sm:px-4 sm:pb-6 sm:pt-2">
                <div className="h-[240px] w-full min-w-0 sm:h-[280px] md:h-[300px] lg:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                dy={8}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 11 }}
                                width={36}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(255,255,255,0.96)",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow:
                                        "0 18px 40px -12px rgb(15 23 42 / 0.15)",
                                    padding: "10px 12px",
                                }}
                                labelStyle={{
                                    fontWeight: 600,
                                    color: "#0f172a",
                                    marginBottom: 4,
                                }}
                                itemStyle={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#334155",
                                }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: "16px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "#64748b",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="pv"
                                name="Pipeline"
                                stroke="#0d9488"
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    fill: "#0d9488",
                                    strokeWidth: 2,
                                    stroke: "#fff",
                                }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="uv"
                                name="Volume"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    fill: "#6366f1",
                                    strokeWidth: 2,
                                    stroke: "#fff",
                                }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
