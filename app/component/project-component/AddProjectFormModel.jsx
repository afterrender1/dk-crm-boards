"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { inter } from '@/app/fonts';
import { FiUser, FiMail, FiGlobe, FiBriefcase, FiAlertCircle, FiX } from "react-icons/fi";

const AddProjectFormModal = ({ isOpen, onClose, onSuccess }) => {
    const [clients, setClients] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        client_id: '',
        project_name: '',
        description: '',
        status: 'Planning',
        budget: '',
        start_date: '',
        deadline: '',
        priority: 'Medium',
        logo_url: ''
    });

    const selectedClient = useMemo(() => {
        return clients.find(c => c.client_id === parseInt(formData.client_id));
    }, [formData.client_id, clients]);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/client')
                .then(res => res.json())
                .then(data => setClients(Array.isArray(data) ? data : data.data || []))
                .catch(err => console.error("Error:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    client_id: parseInt(formData.client_id),
                    budget: parseFloat(formData.budget) || 0
                }),
            });
            if (res.ok) {
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${inter.className}`}>
            {/* Modal Container - Pure White Theme */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col md:flex-row border border-gray-300">

                {/* LEFT SIDE: Form */}
                <div className="flex-[1.5] p-4 md:p-8 lg:p-10 overflow-y-auto border-r border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-black  tracking-tight">New Project</h2>
                            {/* <p className="text-gray-400 text-xs font-bold  tracking-widest mt-1">Devskarnel CRM System</p> */}
                        </div>
                        <button onClick={onClose} className="md:hidden p-2 text-black"><FiX size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Assign Client</label>
                                <select name="client_id" value={formData.client_id} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-black outline-none transition-all appearance-none cursor-pointer  text-sm">
                                    <option value="">Choose Client</option>
                                    {clients.map(client => (
                                        <option className='rounded' key={client.client_id} value={client.client_id}>{client.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Project Name</label>
                                <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required placeholder="Enter project title" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black placeholder:text-gray-300  text-sm transition-all" />
                            </div>

                            <div>
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Budget ($)</label>
                                <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black  text-sm transition-all" />
                            </div>

                            <div>
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Priority Level</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black cursor-pointer  text-sm">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Start Date</label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black  text-sm transition-all" />
                            </div>

                            <div>
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Deadline</label>
                                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black  text-sm transition-all" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Brief Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black resize-none  text-sm transition-all" placeholder="Outline project scope..."></textarea>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[0.8rem] font-black text-black   mb-2">Logo URL</label>
                                <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-black  text-sm transition-all" placeholder="Enter logo URL..." />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border border-gray-300 rounded-lg font-black  text-[0.8rem] tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="flex-2 py-4 bg-black/80 text-white rounded-lg font-black  text-[0.8rem] tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-30">
                                {isSubmitting ? 'Syncing...' : 'Save Project'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT SIDE: Client Context (Also White) */}
                <div className="flex-1 bg-gray-50/30 p-4 md:p-8 lg:p-10 flex flex-col order-first md:order-last">
                    <div className="hidden md:flex justify-end mb-10">
                        <button onClick={onClose} className="text-gray-300 hover:text-black transition-colors"><FiX size={28} /></button>
                    </div>

                    <div className="space-y-8 h-full">
                        <p className="text-[0.8rem] font-black text-gray-400  tracking-[0.3em]">Client Information</p>

                        {selectedClient ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-xl font-black">
                                        {selectedClient.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black  text-black leading-none">{selectedClient.full_name}</h4>
                                        <p className="text-[9px] text-gray-400 font-bold  tracking-widest mt-1.5">{selectedClient.company_name || 'Individual'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-gray-100">
                                    <DetailItem icon={<FiMail />} label="Email Address" value={selectedClient.email} />
                                    <DetailItem icon={<FiGlobe />} label="Location" value={`${selectedClient.city}, ${selectedClient.country}`} />
                                    <DetailItem icon={<FiBriefcase />} label="Website" value={selectedClient.website_url || 'None'} isLink />
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                                <FiUser size={40} className="mb-4" />
                                <p className="text-[0.8rem] font-black ">No Client Selected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value, isLink }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 text-black opacity-30">{icon}</div>
        <div>
            <p className="text-[9px] font-black text-gray-400  tracking-widest mb-1">{label}</p>
            {isLink && value !== 'None' ? (
                <a href={value} target="_blank" className="text-xs font-bold text-black hover:underline break-all">{value}</a>
            ) : (
                <p className="text-xs font-bold text-black">{value}</p>
            )}
        </div>
    </div>
);

export default AddProjectFormModal;