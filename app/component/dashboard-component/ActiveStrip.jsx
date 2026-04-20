"use client"
import React, { useState, useEffect, useMemo } from 'react'
import { urbanist } from '@/app/fonts';
import { FiUsers, FiUserCheck, FiClock, FiUserMinus } from "react-icons/fi";
import { MdOutlineChevronRight } from "react-icons/md";
import { HiOutlineDownload } from "react-icons/hi";

const ActiveStrip = () => {
    const [clientsData, setClientsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStatsData = async () => {
        try {
            const response = await fetch('/api/client');
            const data = await response.json();
            const finalData = Array.isArray(data) ? data : data.data || [];
            setClientsData(finalData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getStatsData();
        const interval = setInterval(getStatsData, 30000);
        return () => clearInterval(interval);
    }, []);

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

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-pulse px-6 mt-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg border border-gray-100 "></div>
                ))}
            </div>
        );
    }

    return (
        <div className={`mt-12 mx-auto max-w-400 px-6 ${urbanist.className}`}>
            
            {/* Main Wrapper like the Image Container */}
            <div className="bg-white/50 p-6 rounded-lg">
                
                {/* Header Section from Image */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Client performance</h2>
                    <div className="flex gap-3">
                        <button className="bg-[#eef5f9] text-[#6bb4d7] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
                            Last 30 Days <MdOutlineChevronRight className="rotate-90 text-xl" />
                        </button>
                        <button className="bg-[#eef5f9] text-[#6bb4d7] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                            <HiOutlineDownload className="text-lg" /> Export Report
                        </button>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    )
}

/* Updated Stat Card Component to match Image */
const StatBox = ({ label, value, icon, iconBg, iconColor }) => (
    <div className="bg-[#F4F6F8] border border-gray-50 p-7 rounded-xl  relative group  transition-all duration-300">
        
        {/* Top Section: Label and Icon */}
        <div className="flex justify-between items-start mb-4">
            <p className="text-[15px] font-medium text-gray-500 tracking-tight">
                {label}
            </p>
            <div className={`w-10 h-10  ${iconColor} rounded-full flex items-center justify-center text-xl`}>
                {icon}
            </div>
        </div>

        {/* Bottom Section: Value and Subtitle */}
        <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-bold text-gray-900 tracking-tight">
                {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
            </h4>
            <p className="text-xs font-semibold text-gray-400">
                From this agency
            </p>
        </div>
    </div>
);

export default ActiveStrip;