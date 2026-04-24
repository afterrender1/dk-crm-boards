"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { inter } from '@/app/fonts';
import {
    FiMoreVertical, FiEdit3, FiUser, FiCalendar,
    FiSearch, FiCheck, FiCircle, FiX, FiInbox
} from "react-icons/fi";
import { User } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    'Planning':    { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'   },
    'In Progress': { bg: 'bg-emerald-50',  text: 'text-emerald-600', dot: 'bg-emerald-500' },
    'Completed':   { bg: 'bg-blue-50',     text: 'text-blue-600',    dot: 'bg-blue-500'    },
    'On Hold':     { bg: 'bg-amber-50',    text: 'text-amber-600',   dot: 'bg-amber-500'   },
};

// BUG FIX #3 — three distinct priority colours
const PRIORITY_CONFIG = {
    'High':   { bar: 'bg-red-500',    label: 'text-red-600'    },
    'Medium': { bar: 'bg-amber-400',  label: 'text-amber-600'  },
    'Low':    { bar: 'bg-emerald-400',label: 'text-emerald-600'},
};

const STATUSES = ["Planning", "In Progress", "Completed", "On Hold"];

/* ─────────────────────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────────────────────── */
const ProjectsGrid = () => {
    const [projects, setProjects]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchTerm, setSearchTerm]     = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

const CACHE_KEY = 'devskarnel_projects_v2';
const {data , mutate} = useSWR('/api/project' , 
    fetcher,
    {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    }
)

const projectsData = useMemo(()=>
{
    if (Array.isArray(data)) return data;
    return data?.projects || data?.data || [];
}, [data]);

    useEffect(() => {
        if (data) {
            setProjects(projectsData);
            setLoading(false);
        }
    }, [data]);

    const filteredProjects = useMemo(() => projectsData.filter(p => {
        const q = searchTerm.toLowerCase();
        const matchesSearch  = p.project_name.toLowerCase().includes(q) ||
                               p.client_name.toLowerCase().includes(q) ||
                               p.client_email.toLowerCase().includes(q) ||
                               p.company_name.toLowerCase().includes(q);
        const matchesStatus  = statusFilter === "All" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    }), [searchTerm, statusFilter, projectsData]);

    const handleEditInitiate = (project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    return (
        <div className={`p-4 md:p-8 rounded-t-4xl bg-white min-h-screen ${inter.className}`}>
            <div className="max-w-7xl mx-auto py-6 md:py-12">

                {/* ── Header & Filters ── */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-black uppercase tracking-tighter">
                            Project Pipeline
                        </h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                            {loading
                                ? "Syncing..."
                                : `Managing ${filteredProjects.length} assignment${filteredProjects.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                >
                                    <FiX size={14} />
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder="Search projects or clients…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-black focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase tracking-tighter outline-none focus:border-black transition-all cursor-pointer"
                        >
                            {["All", ...STATUSES].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => <SkeletonCard key={i} delay={i * 80} />)
                    ) : filteredProjects.length === 0 ? (
                        /* BUG FIX #6 — empty state */
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-300 gap-3">
                            <FiInbox size={40} strokeWidth={1.2} />
                            <p className="text-sm font-bold uppercase tracking-widest">No projects found</p>
                            {(searchTerm || statusFilter !== "All") && (
                                <button
                                    onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
                                    className="mt-2 text-xs font-black uppercase tracking-wider text-black border border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-all"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.project_id}
                                data={project}
                                onUpdate={() => mutate()}
                                onEdit={() => handleEditInitiate(project)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedProject && (
                <EditProjectModal
                    project={selectedProject}
                    onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }}
                    onSuccess={() => mutate()}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────────────────── */
const ProjectCard = ({ data, onUpdate, onEdit }) => {
    const status   = STATUS_CONFIG[data.status]   || STATUS_CONFIG['Planning'];
    // BUG FIX #3 — correct priority colour per level
    const priority = PRIORITY_CONFIG[data.priority] || PRIORITY_CONFIG['Low'];

    const formattedDeadline = data.deadline
        ? new Date(data.deadline).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    return (
        <div className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 hover:border-gray-200">

            {/* Top row */}
            <div className="flex justify-between items-center mb-5">
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                    {data.logo_url
                        ? <img src={data.logo_url} alt={data.project_name} className="w-full h-full object-cover" />
                        : <User size={18} className="text-gray-300" />
                    }
                </div>
                <div className={`px-2.5 py-1 ${status.bg} ${status.text} rounded-full flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 ${status.dot} rounded-full animate-pulse`}></span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{data.status}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-5">
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 truncate">{data.project_name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{data.description || 'No description provided.'}</p>
            </div>

            {/* Meta */}
            <div className="space-y-2.5 mb-5 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiUser size={12} className="text-gray-300 shrink-0" />
                    <span className="font-semibold text-gray-700 truncate">{data.client_name}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <FiCalendar size={12} className="text-gray-300" />
                        <span>{formattedDeadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {/* BUG FIX #3 — priority bar uses correct colour */}
                        <div className={`w-1 h-3.5 rounded-full ${priority.bar}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${priority.label}`}>
                            {data.priority}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onEdit}
                        title="Edit project"
                        className="p-2 rounded-lg text-gray-300 hover:text-black hover:bg-gray-100 transition-all duration-150"
                    >
                        <FiEdit3 size={15} />
                    </button>
                    <StatusDropdown projectId={data.project_id} currentStatus={data.status} onUpdate={onUpdate} />
                </div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[11px] font-bold text-white select-none ring-2 ring-white">
                    {data.client_name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   EDIT MODAL  (PUT)
───────────────────────────────────────────────────────────── */
const EditProjectModal = ({ project, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        project_name: project.project_name || "",
        description:  project.description  || "",
        status:       project.status       || "Planning",
        budget:       project.budget       || "",
        deadline:     project.deadline ? project.deadline.split('T')[0] : "",
        priority:     project.priority     || "Medium",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const patch = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/project/${project.project_id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(formData),
            });
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError("Failed to update. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    // Close on backdrop click
    const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

    // BUG FIX #2 — z-[100] instead of z-100
    return (
        <div
            onClick={handleBackdrop}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 flex items-center justify-center p-4"
        >
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transition-all duration-200 scale-100">
                {/* Modal header */}
                <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-gray-50">
                    <div>
                        <h2 className="text-base font-black uppercase tracking-tighter text-black">Edit Project</h2>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 truncate max-w-xs">{project.project_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="px-8 py-6 space-y-4">
                    {/* Project name */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                            Project Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Redesign Homepage"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-all"
                            value={formData.project_name}
                            onChange={patch('project_name')}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Brief project overview…"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-medium resize-none transition-all"
                            value={formData.description}
                            onChange={patch('description')}
                        />
                    </div>

                    {/* Budget & Deadline — BUG FIX #4: both now have border class */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Budget ($)</label>
                            <input
                                type="number"
                                min={0}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-all"
                                value={formData.budget}
                                onChange={patch('budget')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Deadline</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-all"
                                value={formData.deadline}
                                onChange={patch('deadline')}
                            />
                        </div>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Priority</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-all cursor-pointer"
                                value={formData.priority}
                                onChange={patch('priority')}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Status</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white text-sm font-semibold transition-all cursor-pointer"
                                value={formData.status}
                                onChange={patch('status')}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-black uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   STATUS DROPDOWN  (PATCH)
───────────────────────────────────────────────────────────── */
const StatusDropdown = ({ projectId, currentStatus, onUpdate }) => {
    const [open, setOpen]           = useState(false);
    const [updating, setUpdating]   = useState(false);
    const menuRef                   = useRef(null);

    useEffect(() => {
        const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const updateStatus = async (newStatus) => {
        if (newStatus === currentStatus) { setOpen(false); return; }
        setOpen(false);
        setUpdating(true);
        try {
            const res = await fetch(`/api/project/${projectId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ status: newStatus }),
            });
            if (res.ok) onUpdate();
        } catch (error) {
            console.error("Status update error:", error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                title="Change status"
                disabled={updating}
                onClick={() => setOpen(o => !o)}
                className={`p-2 rounded-lg transition-all duration-150 ${
                    open
                        ? 'bg-black text-white'
                        : updating
                        ? 'text-gray-300 cursor-wait'
                        : 'text-gray-300 hover:text-black hover:bg-gray-100'
                }`}
            >
                <FiMoreVertical size={16} />
            </button>

            {open && (
                <div className="absolute left-0 bottom-full mb-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
                    <p className="px-4 py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50">
                        Change Status
                    </p>
                    {STATUSES.map(s => {
                        const cfg     = STATUS_CONFIG[s];
                        const active  = currentStatus === s;
                        return (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-tight transition-colors ${
                                    active ? 'bg-gray-50 text-black' : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                    {s}
                                </div>
                                {active
                                    ? <FiCheck size={12} className="text-black" />
                                    : <FiCircle size={8} className="text-gray-200" />
                                }
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD  — shimmer animation via Tailwind
───────────────────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
    <div
        className="bg-white border border-gray-100 p-6 rounded-2xl animate-pulse"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex justify-between mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-xl" />
            <div className="w-20 h-6 bg-gray-100 rounded-full" />
        </div>
        <div className="h-5 bg-gray-100 rounded-lg w-3/4 mb-3" />
        <div className="h-3 bg-gray-100 rounded-lg w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3 mb-8" />
        <div className="pt-4 border-t border-gray-50 flex justify-between">
            <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
        </div>
    </div>
);

export default ProjectsGrid;