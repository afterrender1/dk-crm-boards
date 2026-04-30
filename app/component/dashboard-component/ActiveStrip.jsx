"use client"
import React, { useMemo } from 'react';
import { urbanist } from '@/app/fonts';
import { FiUsers, FiUserCheck, FiClock, FiUserMinus } from "react-icons/fi";
import { MdOutlineChevronRight } from "react-icons/md";
import { HiOutlineDownload } from "react-icons/hi";
import useSWR from 'swr';
import { FaAngleDown } from "react-icons/fa";


const fetcher = (url) => fetch(url).then((res) => res.json());


const ActiveStrip = () => {
    const { data: clientsData = [], isLoading } = useSWR('/api/client', fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000,
        focusThrottleInterval: 300000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        fallbackData: [],
    });

    const stats = useMemo(() => {
        if (clientsData.length === 0) return { total: 0, active: 0, pending: 0, closed: 0, projects: 0 };
        return {
            total: clientsData.length,
            active: clientsData.filter(c => c.status === 'Active').length,
            pending: clientsData.filter(c => c.status === 'Pending').length,
            closed: clientsData.filter(c => c.status === 'Closed').length,
            projects: clientsData.length
        };
    }, [clientsData]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 animate-pulse px-3 sm:px-5 md:px-6 mt-6 sm:mt-10">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 sm:h-32 bg-gray-100 rounded-xl border border-gray-100"></div>
                ))}
            </div>
        );
    }

    return (
        <>

            <div className={`text-center mx-auto max-w-auto flex justify-center items-center ${urbanist.className}`}>
                See boards <FaAngleDown/>
            </div>
            <div className={`border border-emerald-300 rounded-lg mt-6 sm:mt-10 md:mt-0 mx-auto max-w-425 px-3 sm:px-5 md:px-6 lg:px-1 ${urbanist.className}`}>

                {/* Main Wrapper like the Image Container */}
                <div className="bg-white/70 border border-gray-100 p-3 sm:p-4 md:p-6 rounded-xl">

                    {/* Header Section from Image */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 sm:mb-6 px-1 sm:px-2 gap-2.5 sm:gap-3">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Client performance</h2>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button className="bg-[#eef5f9] text-[#3f86a8] px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1">
                                Last 30 Days <MdOutlineChevronRight className="rotate-90 text-xl" />
                            </button>
                            <button className="bg-[#eef5f9] text-[#3f86a8] px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                                <HiOutlineDownload className="text-lg" /> Export Report
                            </button>
                        </div>
                    </div>

                    {/* Grid Container */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                        <StatBox
                            label="Total Clients"
                            value={stats.total}
                            icon={<FiUsers />}
                            iconBg="bg-[#e0f2fe]"
                            iconColor="text-[#0ea5e9]"
                        />
                        <StatBox
                            label="Active Clients"
                            value={stats.active}
                            icon={<FiUserCheck />}
                            iconBg="bg-[#f5f3ff]"
                            iconColor="text-[#8b5cf6]"
                        />
                        <StatBox
                            label="Pending Leads"
                            value={stats.pending}
                            icon={<FiClock />}
                            iconBg="bg-[#fff7ed]"
                            iconColor="text-[#f97316]"
                        />
                        <StatBox
                            label="Closed Clients"
                            value={stats.closed}
                            icon={<FiUserMinus />}
                            iconBg="bg-[#f0fdf4]"
                            iconColor="text-[#22c55e]"
                        />
                    </div>
                </div>
            </div>

        </>
    )
}

/* Updated Stat Card Component to match Image */
const StatBox = ({ label, value, icon, iconBg, iconColor }) => (
    <div className="bg-[#F4F6F8] border border-gray-100 p-4 sm:p-5 md:p-6 rounded-xl relative group transition-all duration-300">

        {/* Top Section: Label and Icon */}
        <div className="flex justify-between items-start mb-3 sm:mb-4">
            <p className="text-[13px] sm:text-[15px] font-semibold text-gray-600 tracking-tight">
                {label}
            </p>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 ${iconColor} rounded-full flex items-center justify-center text-lg sm:text-xl`}>
                {icon}
            </div>
        </div>

        {/* Bottom Section: Value and Subtitle */}
        <div className="flex items-baseline gap-1.5 sm:gap-2">
            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
            </h4>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500">
                From this agency
            </p>
        </div>
    </div>
);

export default ActiveStrip;