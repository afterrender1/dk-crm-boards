"use client"
import AddClientFormModal from '@/app/component/client-component/AddClientFormModel';
import ClientsDataTable from '@/app/component/client-component/ClientsDataTable';
import React, { useState, useRef } from 'react'
import { inter } from '@/app/fonts';
import { gsap } from "gsap";

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const animateModal = () => {
    gsap.fromTo(".model-post", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.5 });
  }

  return (
    <div className={`min-h-screen bg-[#f8f9fa] ${inter.className} pb-20`}>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          {/* Left Side: Text Content */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black/70 tracking-tight leading-tight">
              <span className="hidden sm:inline">Devskarnel Customer Relation Management</span>
              <span className="sm:hidden">Devskarnel CRM</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              View and manage your agency's client database
            </p>
          </div>

          {/* Right Side: Button */}
          <button
            onClick={openModal}
            className="w-full sm:w-auto cursor-pointer group flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded font-bold text-sm uppercase tracking-wider transition-all hover:bg-gray-800 active:scale-95 shadow-md shrink-0"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span className="whitespace-nowrap">Create Client</span>
          </button>
        </div>
      </header>

      <main className="max-w-420 mx-auto px-6 mt-8">

        {/* Table Container */}
        <div className="bg-white border p-4 border-gray-200 rounded-lg  overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Recent Clients</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search clients..."
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <ClientsDataTable />
        </div>
      </main>

      {/* Modal Component */}
      <div className='model-post'>
        <AddClientFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  )
}

const StatCard = ({ label, count, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <div className="flex items-baseline gap-2 mt-2">
      <h4 className="text-3xl font-bold text-gray-900">{count}</h4>
      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
  </div>
);

export default Page