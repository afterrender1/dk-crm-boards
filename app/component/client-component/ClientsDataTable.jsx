"use client"
import React, { useMemo, useState } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { inter } from '@/app/fonts';
import { GrEdit } from "react-icons/gr";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());
const getClientAvatar = (client) =>
    client?.profile_image_url ||
    (client?.gender === "Male"
        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz7qJ9pU6Xj2EJKaRDVz-9Bd0xh2LnMklGw&s"
        : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/user-female-icon.png");

const ClientsDataTable = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const router = useRouter();

    const { data, mutate } = useSWR('/api/client', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    const clientsData = useMemo(() => {
        if (Array.isArray(data)) return data;
        return data?.data || [];
    }, [data]);

    const handleEditClick = (client) => {
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };
    const handleDeleteClick = async (client) => {
        try {
            setSelectedClient(client);
            const confirmed = confirm("Are you sure you want to delete this client? This action cannot be undone.");
            if (!confirmed) return;
            const res = await fetch(`/api/client/${client.client_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            })
            if (res.ok) {
                await mutate();
            }
        } catch (error) {
            console.log(error);

        }
    }

    const handleUpdateChange = (e) => {
        setSelectedClient({ ...selectedClient, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/client/${selectedClient.client_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedClient)
            });
            if (res.ok) {
                await mutate(); // Refresh from SWR cache
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Update error:", error);
        }
        console.log(selectedClient);

    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-50 text-green-600 border-green-100';
            case 'Closed': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        }
    }

    return (
        <>
            <div className="w-full rounded-2xl border border-gray-100 bg-white p-2 sm:p-3 md:p-4">
                <div className="overflow-x-auto">
            <Table className={`${inter.className} min-w-[980px] text-xs sm:text-sm`}>
                <TableCaption className="text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4">A comprehensive list of your agency clients.</TableCaption>
                <TableHeader className="bg-gray-50/60">
                    <TableRow>
                        <TableHead className="w-20 px-2.5 sm:px-3 py-2.5 sm:py-3 text-[11px] sm:text-xs text-gray-600">ID</TableHead>
                        <TableHead className="font-semibold text-[11px] sm:text-xs text-gray-700">Client & Company</TableHead>
                        <TableHead className="text-[11px] sm:text-xs text-gray-600">Contact Info</TableHead>
                        <TableHead className="text-[11px] sm:text-xs text-gray-600">Location</TableHead>
                        <TableHead className="text-[11px] sm:text-xs text-gray-600">Status</TableHead>
                        <TableHead className="text-[11px] sm:text-xs text-gray-600">Website</TableHead>
                        <TableHead className="text-right text-[11px] sm:text-xs text-gray-600">Joined Date</TableHead>
                        <TableHead className="text-right text-[11px] sm:text-xs text-gray-600">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clientsData.map((client) => (
                        <TableRow key={client.client_id} className="border-none hover:bg-gray-50/60 transition-colors">
                            <TableCell className="text-gray-500 text-xs px-2.5 sm:px-3 py-2.5 sm:py-3">{client.client_id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2.5 sm:gap-3 hover:bg-gray-100 cursor-pointer px-2 py-2.5 sm:p-3 rounded-xl transition-colors" onClick={() => {
                                    router.push(`/client/${client.client_id}`)
                                }}>
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#d9fff6] border border-[#d9fff6] flex items-center justify-center overflow-hidden shrink-0">
                                        <img
                                            src={getClientAvatar(client)}
                                            height={200}
                                            width={200}
                                            alt="Client Profile"
                                            className="rounded-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-none mb-1">
                                            {client.full_name}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] text-gray-500 leading-none">
                                            {client.company_name || 'No Company'}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-[11px] sm:text-xs space-y-1">
                                    <span className="text-gray-600 font-medium">{client.email}</span>
                                    <span className="text-gray-500">{client.phone_number || 'N/A'}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-[11px] sm:text-xs">
                                    <span className="text-gray-600">{client.city}, {client.country}</span>
                                    <p className="text-gray-500 text-[10px]">{client.state}</p>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyles(client.status)}`}>
                                    {client.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                {client.website_url ? (
                                    <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-[11px] sm:text-xs font-medium">Visit Site</a>
                                ) : <span className="text-gray-300 text-[11px] sm:text-xs">None</span>}
                            </TableCell>
                            <TableCell className="text-right text-[11px] sm:text-xs text-gray-500">
                                {new Date(client.created_at).toLocaleDateString('en-GB')}
                            </TableCell>
                            <TableCell className="text-right gap-1.5 sm:gap-2 flex justify-end">
                                <div
                                    onClick={() => handleEditClick(client)}
                                    className='inline-flex hover:bg-blue-500 p-1.5 sm:p-2 active:scale-95 rounded-md hover:text-white text-gray-500 cursor-pointer duration-300'
                                >
                                    <GrEdit />
                                </div>
                                <div
                                    onClick={() => handleDeleteClick(client)}
                                    className='inline-flex hover:bg-red-500 p-1.5 sm:p-2 active:scale-95 rounded-md hover:text-white text-gray-500 cursor-pointer duration-300'
                                >
                                    <MdOutlineDeleteOutline />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
                </div>
            </div>

            {/* --- EDIT MODAL (WHITE THEME) --- */}
            {isEditModalOpen && selectedClient && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92vh]">
                        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit Client</h2>
                                <p className="text-xs text-gray-500">Update details for {selectedClient.full_name}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                <ModalInput label="Full Name" name="full_name" value={selectedClient.full_name} onChange={handleUpdateChange} />
                                <ModalInput label="Email" name="email" type="email" value={selectedClient.email} onChange={handleUpdateChange} />
                                <ModalSelect label="Gender" name="gender" value={selectedClient.gender} onChange={handleUpdateChange} options={['Male', 'Female', 'Other']} />
                                <ModalSelect label="Status" name="status" value={selectedClient.status} onChange={handleUpdateChange} options={['Pending', 'Active', 'Closed']} />
                                <ModalInput label="Phone" name="phone_number" value={selectedClient.phone_number} onChange={handleUpdateChange} />
                                <ModalInput label="Company" name="company_name" value={selectedClient.company_name} onChange={handleUpdateChange} />
                                <ModalInput label="Website" name="website_url" value={selectedClient.website_url} onChange={handleUpdateChange} />
                                <ModalInput label="Country" name="country" value={selectedClient.country} onChange={handleUpdateChange} />
                                <ModalInput label="State" name="state" value={selectedClient.state} onChange={handleUpdateChange} />
                                <ModalInput label="City" name="city" value={selectedClient.city} onChange={handleUpdateChange} />
                                <ModalInput label="Lead Source" name="lead_source" value={selectedClient.lead_source} onChange={handleUpdateChange} />
                                <ModalInput label="Lead Stage" name="lead_stage" value={selectedClient.lead_stage} onChange={handleUpdateChange} />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-4 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-sm font-medium text-gray-500 hover:text-gray-900">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-black text-white text-sm font-bold rounded hover:bg-gray-800 transition shadow-lg active:scale-95">
                                    Update Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

/* Modal Helper Components */
const ModalInput = ({ label, ...props }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
        <input {...props} className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all" />
    </div>
);

const ModalSelect = ({ label, options, ...props }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
        <select {...props} className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm outline-none cursor-pointer">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default ClientsDataTable