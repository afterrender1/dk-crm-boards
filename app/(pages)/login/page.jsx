"use client"
import { inter } from '@/app/fonts'
import React, { useState } from 'react'
import Link from 'next/link'

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Attempting Login:", formData.email);
        
        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.success) {
                console.log("Login Successful ✨");
                // Yahan aap redirect kar sakte hain, e.g., window.location.href = '/dashboard'
          
            window.location.href = '/dashboard';
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 ${inter?.className}`}>
            <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-12">

                {/* Logo & Header */}
                <div className="mb-8 sm:mb-10">
                    <div className="w-10 h-10 bg-[#5833b6] rounded-lg flex flex-wrap p-1.5 mb-4">
                        <div className="w-1/2 h-1/2 p-0.5"><div className="w-full h-full bg-white/40 rounded-sm"></div></div>
                        <div className="w-1/2 h-1/2 p-0.5"><div className="w-full h-full bg-white rounded-sm"></div></div>
                        <div className="w-1/2 h-1/2 p-0.5"><div className="w-full h-full bg-white rounded-sm"></div></div>
                        <div className="w-1/2 h-1/2 p-0.5"><div className="w-full h-full bg-white/40 rounded-sm"></div></div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
                    <p className="text-sm text-gray-500 leading-relaxed">Welcome back! Please enter your details to access your agency dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange}
                            type="email" 
                            placeholder="example@gmail.com" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5833b6] transition-all text-sm sm:text-base"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-[#5833b6] hover:underline">Forgot?</a>
                        </div>
                        <input
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange}
                            type="password" 
                            placeholder="••••••••" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5833b6] transition-all text-sm sm:text-base"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 bg-[#5833b6] rounded-xl font-semibold text-white hover:bg-[#462894] transition-all shadow-lg shadow-purple-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Login to Account"}
                    </button>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Don't have an account? <Link href="/signup" className="text-[#5833b6] font-semibold hover:underline">Create one</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default LoginPage