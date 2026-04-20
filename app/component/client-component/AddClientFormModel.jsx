"use client";
import React, { useState, useLayoutEffect, useRef } from 'react';
import { inter } from '@/app/fonts';
import { RxCross1 } from "react-icons/rx";
import { FaFilesPinwheel } from "react-icons/fa6";
import { FiChevronDown } from "react-icons/fi"; // For custom select arrow
import gsap from 'gsap';

const AddClientFormModal = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    const [formData, setFormData] = useState({
        full_name: '',
        profile_image_url : "",
        gender: 'Male',
        email: '',
        phone_number: '',
        country: '',
        state: '',
        city: '',
        status: 'Pending',
        company_name: '',
        website_url: '',
        lead_source: '',
        lead_stage: 'New'
    });

    useLayoutEffect(() => {
        if (isOpen) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.98, y: 10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" }
            );
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const res = await fetch('/api/client', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsLoading(false);
                onClose();
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div ref={overlayRef} className={`fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 ${inter.className}`}>
            <div ref={modalRef} className="bg-white w-full max-w-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200">

                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Register New Client</h2>
                        <p className="text-sm text-black/90  mt-0.5">Create new client record to manage future interactions</p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                        <RxCross1 size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-2 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* PERSONAL INFORMATION SECTION */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-slate-900 rounded-full"></div>

                            <h3 className="text-[0.9rem] text-black">Personal Information</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 ">
                            <Input label="Full Name *" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="First and last name" required />
                            <Input label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" required />
                            <Input label="Profile Image Url" name="profile_image_url" type="text" value={formData.profile_image_url} onChange={handleChange} placeholder="http://" required />
                            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
                            <Select label="Account Status" name="status" value={formData.status} onChange={handleChange} options={['Pending', 'Active', 'Closed']} />
                        </div>
                    </div>

                    {/* BUSINESS DETAILS SECTION */}
                    <div className="pt-4 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
                            <h3 className="text-[0.9rem]    text-black">Business Context</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                            <Input label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Legal business name" />
                            <Input label="Website URL" name="website_url" type="url" value={formData.website_url} onChange={handleChange} placeholder="https://www.example.com" />
                            <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+92 3XX XXXXXXX" />
                            <Input label="Lead Source" name="lead_source" value={formData.lead_source} onChange={handleChange} placeholder="e.g. LinkedIn, Referral" />
                        </div>
                        <div className="w-full">
                            <Select
                                label="Lead Pipeline Stage"
                                name="lead_stage"
                                value={formData.lead_stage}
                                onChange={handleChange}
                                options={['New', 'Contacted', 'Qualified', 'Converted', 'Lost']}
                            />
                        </div>
                    </div>

                    {/* LOCATION SECTION */}
                    <div className="pt-4 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-slate-900 rounded-full"></div>

                            <h3 className="text-[0.9rem] text-black">Geographic Data</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-2">
                            <Input label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="Pakistan" />
                            <Input label="State / Province" name="state" value={formData.state} onChange={handleChange} placeholder="Sindh" />
                            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Karachi" />
                        </div>
                    </div>

                    {/* Footer - Fixed Button Style */}
                    <div className="flex justify-end items-center gap-6 pt-2 border-t border-slate-50 mt-4">
                        <button type="button" onClick={onClose} className="text-xs font-bold uppercase text-black rounded-sm cursor-pointer  px-6 py-4 hover:bg-gray-100 hover:text-slate-900 tracking-widest transition-all">Cancel</button>
                        <button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-black text-white px-6 cursor-pointer py-4 rounded-sm text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50">
                            {isLoading ? <FaFilesPinwheel className="animate-spin" /> : "Authorize & Sync"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* Redesigned Input Components for better visibility */
const Input = ({ label, ...props }) => (
    <div className="group space-y-1.5">
        <label className="block text-[0.8rem] font-bold text-black/70   transition-colors ">
            {label}
        </label>
        <input
            {...props}
            className="w-full bg-white border border-slate-300 rounded-sm px-4 py-3 text-slate-900 text-sm font-medium placeholder-slate-300 outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
        />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="group space-y-1.5">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-focus-within:text-slate-900">
            {label}
        </label>
        <div className="relative">
            <select
                {...props}
                className="w-full bg-white border border-slate-300 rounded-sm px-4 py-3 text-slate-900 text-sm font-semibold outline-none focus:border-slate-900 appearance-none cursor-pointer transition-all"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <FiChevronDown size={16} />
            </div>
        </div>
    </div>
);

export default AddClientFormModal;