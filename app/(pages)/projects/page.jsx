"use client";

import React, { useState, useEffect } from 'react';
import { inter } from '@/app/fonts';
import AddProjectFormModal from '@/app/component/project-component/AddProjectFormModel';
import ProjectsData from '@/app/component/project-component/ProjectsData';

const Page = () => {
  const [showModal, setShowModal] = useState(false);

  // 1. Refresh Trigger State banayein
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 2. Refresh function jo key ko barhaye ga
  const handleRefresh = () => {
    // Session Storage clear karein taake naya data load ho
    sessionStorage.removeItem('devskarnel_projects');
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle body scroll based on modal state
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  return (
    <>
      <div className={`min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-[#F4F6F8] p-4 md:p-6 lg:p-8 ${inter.className}`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Projects</h1>

          <button
            onClick={() => setShowModal(true)}
            className="active:scale-95 w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium text-sm"
          >
            <span className="text-xl leading-none">+</span>
            Create New Project
          </button>
        </div>

        {/* Modal */}
        <AddProjectFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          // 3. Success par refresh function call karein
          onSuccess={handleRefresh}
        />

        {/* 4. ProjectsData ko key pass karein */}
        <ProjectsData key={refreshTrigger} />

      </div>
    </>
  );
};

export default Page;