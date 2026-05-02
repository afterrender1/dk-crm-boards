"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Sidebar = dynamic(() => import("./component/Sidebar"), {
    ssr: false,
    loading: () => (
        <div className="shrink-0">
            <div className="hidden md:block h-0 w-20" aria-hidden />
            <div className="md:hidden h-16 shrink-0" aria-hidden />
        </div>
    ),
});

export default function ClientLayout({ children }) {
    const pathname = usePathname() || "";
    const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
    const mainClass = isAuthPage
        ? "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip"
        : "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip md:ml-20";

    return (
        <div className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-clip">
            <Sidebar />
            <main className={mainClass}>{children}</main>
        </div>
    );
}
