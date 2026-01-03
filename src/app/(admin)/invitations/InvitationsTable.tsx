"use client";

import type { StudentPackageModel } from "@/backend/models";
import { formatDate } from "@/getters/date-getter";
import { Trash2 } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { cancelStudentPackageRequest } from "@/actions/student-package-action";
import toast from "react-hot-toast";
import Image from "next/image";
import { PackageComparisonBadge } from "@/src/components/ui/badge/PackageComparisonBadge";
import BookingIcon from "@/public/appSvgs/BookingIcon";

interface InvitationsTableProps {
    invitations: StudentPackageModel[];
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
    if (invitations.length === 0) {
        return (
            <div className="text-center p-20 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                <p className="font-bold text-zinc-400 uppercase tracking-widest">No pending invitations</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-y-4">
                    <thead className="text-[10px] uppercase text-zinc-400 tracking-widest font-bold">
                        <tr>
                            <th className="px-8 py-2 w-[55%]">Package & Booking</th>
                            <th className="px-6 py-2">Request From</th>
                            <th className="px-6 py-2 text-center">Status</th>
                            <th className="px-8 py-2 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations.map((invitation) => (
                            <InvitationRow key={invitation.schema.id} invitation={invitation} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BookingDateInline({ startDate, endDate }: { startDate: string | Date; endDate: string | Date }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    return (
        <div className="flex items-center gap-2 mt-3 group/date w-fit">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-50 text-zinc-400 border border-zinc-100">
                <BookingIcon size={16} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-bold text-zinc-700 text-xs">
                    {formatDate(start)}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                    +{diffDays} {diffDays === 1 ? "Day" : "Days"}
                </span>
            </div>
        </div>
    );
}

function InvitationRow({ invitation }: { invitation: StudentPackageModel }) {
    const { id, requestedDateStart, requestedDateEnd, status, walletId } = invitation.schema;
    const { 
        description: packageDesc, 
        categoryEquipment, 
        capacityEquipment, 
        capacityStudents, 
        packageType,
        durationMinutes,
        pricePerStudent,
        currency
    } = invitation.relations?.schoolPackage || {
        description: "Unknown",
        categoryEquipment: "kite",
        capacityEquipment: 1,
        capacityStudents: 1,
        packageType: "lessons",
        durationMinutes: 60,
        pricePerStudent: 0,
        currency: "EUR"
    };
    
    // Calculation logic
    const durationHours = durationMinutes / 60;
    const pph = durationMinutes !== 60 ? Math.round(pricePerStudent / durationHours) : pricePerStudent;
    const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;

    const handleDelete = async () => {
        if (confirm("Are you sure you want to remove this request?")) {
            const result = await cancelStudentPackageRequest(id);
            if (result.success) {
                toast.success("Request removed");
            } else {
                toast.error("Failed to remove request");
            }
        }
    };

    const statusColors = {
        requested: "bg-blue-50 text-blue-600 border-blue-100",
        accepted: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rejected: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <tr className="bg-white group transition-transform hover:translate-x-1">
            {/* Package & Booking Column */}
            <td className="px-8 py-6 align-middle rounded-l-3xl border-y border-l border-zinc-100 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="font-black text-lg text-zinc-900 uppercase italic tracking-tighter leading-none">
                                {packageDesc}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-100">
                                {packageType}
                            </span>
                        </div>
                        
                        <PackageComparisonBadge 
                            categoryEquipment={categoryEquipment}
                            equipmentCapacity={capacityEquipment}
                            studentCapacity={capacityStudents}
                            packageDurationHours={parseFloat(durationHours.toFixed(1))}
                            pricePerHour={pph}
                            currencySymbol={currencySymbol}
                        />
                    </div>

                    <BookingDateInline startDate={requestedDateStart.toString()} endDate={requestedDateEnd.toString()} />
                </div>
            </td>

            {/* Wallet Column */}
            <td className="px-6 py-6 align-middle border-y border-zinc-100 shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase text-zinc-400">From</span>
                    <span className="font-mono text-xs font-medium text-zinc-600 truncate max-w-[140px] bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 select-all" title={walletId}>
                        {walletId}
                    </span>
                </div>
            </td>

            {/* Status Column */}
            <td className="px-6 py-6 align-middle text-center border-y border-zinc-100 shadow-sm">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColors[status] || "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>
                    {status}
                </span>
            </td>

            {/* Action Column */}
            <td className="px-8 py-6 text-right align-middle rounded-r-3xl border-y border-r border-zinc-100 shadow-sm">
                <div className="flex justify-end items-center gap-6">
                    <div className="relative w-8 h-8 opacity-20 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110">
                        <Image src="/ADR.webp" alt="ADR" fill className="object-contain" />
                    </div>
                    <button 
                        onClick={handleDelete}
                        className="p-3 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                        title="Remove Request"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}