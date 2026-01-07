"use client";

import { useState } from "react";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import { updateStudentPackageStatus } from "@/supabase/server/student-package";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import Image from "next/image";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { PackageComparisonBadge } from "@/src/components/ui/badge/PackageComparisonBadge";
import { Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface InvitationsTableProps {
    invitations: StudentPackageRequest[];
}

export function InvitationsTable({ invitations }: InvitationsTableProps) {
    if (invitations.length === 0) {
        return (
            <div className="text-center p-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <p className="font-bold text-zinc-400 uppercase tracking-widest">No pending invitations</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-y-4">
                    <thead className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 tracking-widest font-bold">
                        <tr>
                            <th className="px-8 py-2 w-[45%]">Package Details</th>
                            <th className="px-6 py-2">Booking Dates</th>
                            <th className="px-6 py-2">Request From</th>
                            <th className="px-6 py-2 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations.map((invitation) => (
                            <InvitationRow key={invitation.id} invitation={invitation} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InvitationRow({ invitation }: { invitation: StudentPackageRequest }) {
    const [isPending, setIsPending] = useState(false);
    const { id, requested_date_start, requested_date_end, status, wallet_id } = invitation;
    const {
        description: packageDesc,
        category_equipment,
        capacity_equipment,
        capacity_students,
        package_type,
        duration_minutes,
        price_per_student,
    } = invitation.school_package || {
        description: "Unknown",
        category_equipment: "kite",
        capacity_equipment: 1,
        capacity_students: 1,
        package_type: "lessons",
        duration_minutes: 60,
        price_per_student: 0,
    };

    // Calculation logic
    const durationHours = duration_minutes / 60;
    const pph = duration_minutes !== 60 ? Math.round(price_per_student / durationHours) : price_per_student;
    const currencySymbol = "€"; // Standardized for now, or fetch from school context
    const isRental = package_type?.toLowerCase().includes("rental");

    const statusColors = {
        requested: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        accepted: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        rejected: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    } as Record<string, string>;

    const handleAction = async (newStatus: string) => {
        setIsPending(true);
        const result = await updateStudentPackageStatus(id, newStatus);
        if (result.success) {
            toast.success(`Request ${newStatus}`);
        } else {
            toast.error(result.error || "Failed to update request");
        }
        setIsPending(false);
    };

    return (
        <tr className="bg-white dark:bg-zinc-900 group transition-all border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700">
            {/* Package Column */}
            <td className="px-8 py-8 align-middle rounded-l-3xl border-y border-l border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="pl-1">
                        <span className="font-black text-xl text-zinc-900 dark:text-white uppercase italic tracking-tighter leading-none block">
                            {packageDesc}
                        </span>
                    </div>
                    <PackageComparisonBadge
                        categoryEquipment={category_equipment}
                        equipmentCapacity={capacity_equipment}
                        studentCapacity={capacity_students}
                        packageDurationHours={parseFloat(durationHours.toFixed(1))}
                        pricePerHour={pph}
                        currencySymbol={currencySymbol}
                    />
                </div>
            </td>

            {/* Dates Column */}
            <td className="px-6 py-8 align-middle border-y border-zinc-100 dark:border-zinc-800 shadow-sm">
                <DateRangeBadge startDate={requested_date_start} endDate={requested_date_end} />
            </td>

            {/* Wallet Column */}
            <td className="px-6 py-8 align-middle border-y border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500">From</span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border ${isRental ? "text-red-400 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10" : "text-blue-400 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10"}`}>
                            {package_type}
                        </span>
                    </div>
                    <span className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate max-w-[140px] bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-700 select-all" title={wallet_id}>
                        {wallet_id}
                    </span>
                </div>
            </td>

            {/* Status Column */}
            <td className="px-6 py-8 align-middle text-right rounded-r-3xl border-y border-r border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                        {status === "requested" && (
                            <div className="flex items-center gap-2 mr-2">
                                <button
                                    onClick={() => handleAction("accepted")}
                                    disabled={isPending}
                                    className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                    title="Accept Request"
                                >
                                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                                </button>
                                <button
                                    onClick={() => handleAction("rejected")}
                                    disabled={isPending}
                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg shadow-red-500/20"
                                    title="Reject Request"
                                >
                                    <X size={16} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColors[status] || "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>
                            {status}
                        </span>
                    </div>
                    <div className="relative w-8 h-8 opacity-10 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110">
                        <Image src="/ADR.webp" alt="ADR" fill className="object-contain" />
                    </div>
                </div>
            </td>
        </tr>
    );
}
