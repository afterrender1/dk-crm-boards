"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { inter } from '@/app/fonts';
import {
  FiMail, FiPhone, FiGlobe, FiMapPin,
  FiEdit3, FiPlus, FiArrowUpRight, FiClock, FiArrowLeft
} from "react-icons/fi";
import { useParams, useRouter } from 'next/navigation';
import AddClientNotesModal from '@/app/component/client-component/AddClientNotesModel';

const UI = {
  text: {
    title: 'text-[#65D1E5]  tracking-tighter',
    label: 'text-[10px]  uppercase tracking-wider text-slate-400',
    value: 'text-sm font-semibold text-slate-800',
  },
  btn: {
    primary: 'bg-[#65D1E5] hover:bg-[#57CAD9] text-white shadow-md transition-all active:scale-95',
    secondary: 'border border-slate-200 hover:border-black text-slate-600 hover:text-black transition-all',
  },
  card: 'bg-white border border-slate-100 rounded-xl overflow-hidden'
};

const ClientProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
console.log(id);

  const fetchClient = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/client/${id}`);

      if (res.status === 404) {
        setError("Client not found");
        setData(null);
        return;
      }

      if (!res.ok) throw new Error("Server error");

      const result = await res.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50  text-[10px] uppercase tracking-widest text-slate-400">Syncing...</div>;

  // Handle 404 or Error State
  if (error || !data) return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center ${inter.className}`}>
      <h2 className="text-2xl  text-slate-900 uppercase tracking-tighter mb-2">{error || "No Record"}</h2>
      <p className="text-slate-400 text-xs  uppercase tracking-widest mb-6">The requested client ID does not exist in our system.</p>
      <button
        onClick={() => router.push('/clients')}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[10px]  uppercase tracking-widest rounded-xl transition-transform active:scale-95"
      >
        <FiArrowLeft /> Return to Pipeline
      </button>
    </div>
  );

  const { client, notes } = data;

  return (
    <div className={`min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-10 ${inter.className}`}>
      <div className="max-w-5xl mx-auto">

        {/* ACTION BAR */}
        <div className="bg-white p-4 shadow-sm rounded-lg flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#65D1E5] shrink-0 overflow-hidden shadow-sm bg-slate-100">
              <img src={client.profile_image_url || (
                client.gender === "Male" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
                  : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png"
              )} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h1 className={`text-xl ${UI.text.title}`}>{client.full_name}</h1>
              <span className='text-[12px]'>
                Deal:

              </span>
              <span className="text-[10px]  px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded uppercase tracking-tighter border border-emerald-100">
                {client.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {/* <button className={`${UI.btn.secondary} p-2.5 rounded-lg`} title="Edit Profile"><FiEdit3 size={16} /></button> */}
            <button onClick={() => setIsModalOpen(true)} className={`${UI.btn.primary} px-4 py-2 rounded-lg text-xs  flex items-center gap-2`}>
              <FiPlus /> New Note
            </button>
          </div>
        </div>

        <AddClientNotesModal
          clientId={id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchClient(false)} // Silent refresh (no loading screen)
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className={` shadow-sm ${UI.card} p-5`}>
              <h2 className={`${UI.text.label} mb-4 flex items-center justify-between`}>
                Contact Points <FiArrowUpRight className="opacity-30" />
              </h2>
              <div className="space-y-4">
                <IconData icon={<FiMail />} label="Email" value={client.email} />
                <IconData icon={<FiPhone />} label="Mobile" value={client.phone_number} />
                <IconData icon={<FiGlobe />} label="Website" value={client.website_url} isLink />
                <IconData icon={<FiMapPin />} label="Region" value={`${client.city}, ${client.country}`} />
              </div>
            </div>

            <div className={` shadow-sm ${UI.card} p-5 bg-emerald-950`}>
              <h2 className="text-[10px]  uppercase tracking-widest text-emerald-500 mb-3">Lifecycle</h2>
              <p className="text-sm font-medium text-black/80 leading-relaxed">
                Stage: <span className="text-[#65D1E5] ">{client.lead_stage}</span>.
                <br />
                Source: <span className="text-black ">{client.lead_source || "Organic"}</span>.
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className={`shadow-sm ${UI.card} h-full`}>
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0">
                <h2 className={UI.text.label}>Activity Timeline</h2>
                <span className="text-[10px] font-mono text-slate-300">Total Entries: {notes.length}</span>
              </div>

              <div className="p-6">
                {notes.length > 0 ? (
                  <div className="space-y-6">
                    {notes.map((n) => (
                      <div key={n.note_id} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1 before:w-0.5 before:h-full before:bg-slate-100 last:before:h-4">
                        <div className="absolute left-0.75 top-1 w-2 h-2 rounded-full bg-[#65D1E5] ring-4 ring-white" />
                        <div className="mb-1 text-[10px]  text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                          <FiClock size={10} /> {new Date(n.created_at).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{n.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-xs  text-slate-300 uppercase tracking-widest">No entries yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IconData = ({ icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-[#65D1E5]">{icon}</div>
    <div className="min-w-0">
      <p className={UI.text.label}>{label}</p>
      {isLink ? (
        <a href={value} target="_blank" className="text-xs  text-slate-900 hover:text-[#65D1E5] truncate block transition-colors">
          {value?.replace(/(^\w+:|^)\/\//, '')}
        </a>
      ) : (
        <p className="text-xs  text-slate-800 truncate">{value || '—'}</p>
      )}
    </div>
  </div>
);

export default ClientProfile;