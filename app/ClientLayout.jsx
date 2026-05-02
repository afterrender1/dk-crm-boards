"use client";

import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./component/Sidebar"), {
    ssr: false,
    loading: () => (
        <>
            <div className="hidden md:block w-20 shrink-0 bg-white border-r border-gray-200" />
            <div className="md:hidden h-16 shrink-0" />
        </>
    ),
});

export default function ClientLayout({ children }) {
    return (
        <>
            <Sidebar />
            {children}
        </>
    );
}
