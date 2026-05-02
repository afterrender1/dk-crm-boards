"use client"

import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { Pencil, Camera, X, Check } from 'lucide-react'
import { urbanist } from '../fonts'

const LoginProfile = () => {
    const { user, loading } = useUser()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    if (loading) return <div className="p-8 text-center text-purple-600 animate-pulse">Loading profile...</div>
    if (!user) return <div className="p-8 text-center text-gray-500">No user data found.</div>

    return (
        <div className={`min-h-screen bg-gray-50/50 p-4 ${urbanist.className}`}>
            <div className="max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your profile</h2>
                    <span className="text-sm text-gray-500">
                        Joined {user?.joinedDate || '2/6/23'}
                    </span>
                </div>

                {/* Profile Image Section */}
                <div className="relative w-24 h-24 mb-6">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 shadow-inner">
                        <img
                            src={user?.image || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm">
                        <Camera size={16} className="text-gray-600" />
                    </div>
                </div>

                {/* User Info & Edit Button */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            {user?.name}
                        </h3>

                        <div className="text-gray-500 text-sm">
                            <p>{user?.phone || '+880 1924699597'}</p>
                            <p>{user?.email}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-gray-700">
                                    {user?.role || 'User'}
                                </span>
                                <span className="text-[10px] text-gray-400 self-center">
                                    ID: {user?.user_id}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] px-5 py-2 rounded-full transition-all font-medium text-sm active:scale-95"
                    >
                        <Pencil size={16} />
                        Edit
                    </button>
                </div>
            </div>

            {/* Render Modal */}
            {isEditModalOpen && (
                <ProfileEditModal
                    user={user}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    )
}

const ProfileEditModal = ({ user, onClose }) => {
    const handleformsubmit = async (e) => {
        try {
            e.preventDefault();
            console.log(user?.name);
            console.log(user?.nmber);
            console.log(user?.name);


        } catch (error) {
            console.log(error);

        }

    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${urbanist.className}`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <p className="text-gray-500 text-sm">Update your personal information below.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => handleformsubmit(e)

                }>
                    {/* Image Edit Preview */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-50 group-hover:border-purple-100 transition-colors">
                                <img
                                    src={user?.image || 'https://via.placeholder.com/150'}
                                    alt="Preview"
                                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-full">
                                <Camera size={28} className="text-white" />
                            </div>
                        </div>
                        <button className="mt-3 text-sm font-bold text-purple-600 hover:text-purple-700">
                            Change photo
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                            <input
                                type="text"
                                defaultValue={user?.name}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-900"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                            <input
                                type="tel"
                                defaultValue={user?.phone || '+880 1924699597'}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginProfile