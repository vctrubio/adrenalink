"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import adrLogo from "@/public/ADR.webp";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { PackageComparisonBadge } from "@/src/components/ui/badge/PackageComparisonBadge";
import { Check, X, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import { formatDate, getRelativeDateLabel } from "@/getters/date-getter";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getCurrencySymbol } from "@/supabase/db/currency";
import { updateStudentPackageStatus } from "@/supabase/server/student-package";
import { STUDENT_PACKAGE_REQUEST_STATUS_CONFIG } from "@/types/status";
import type { StudentPackageRequest } from "@/supabase/server/student-package";

function InfoColumn({
    top,
    bottom,
    className = "",
    align = "left",
}: {
    top: React.ReactNode;
    bottom: React.ReactNode;
    className?: string;
    align?: "left" | "right";
}) {
    const alignmentClass = align === "right" ? "items-end text-right" : "items-start text-left";
    const justifyClass = align === "right" ? "justify-end" : "justify-start";

    return (
        <td className={`px-6 py-8 align-middle border-y border-zinc-100 dark:border-zinc-800 shadow-sm ${className}`}>
            <div className={`flex flex-col gap-3 ${alignmentClass}`}>
                <div className="flex items-center gap-2 h-7">{top}</div>
                <div className={`flex items-center gap-2 pt-3 border-t border-border/50 w-full ${justifyClass}`}>{bottom}</div>
            </div>
        </td>
    );
}

interface StudentPackageRequestRowProps {
    invitation: StudentPackageRequest;
    onAccept: () => void;
}

export function StudentPackageRequestRow({ invitation, onAccept }: StudentPackageRequestRowProps) {
    const { currency } = useSchoolCredentials();
    const currencySymbol = getCurrencySymbol(currency);
    const [isPending, setIsPending] = useState(false);
    const { id, requested_date_start, requested_date_end, status, requested_clerk_id, created_at, school_package } = invitation;

    const {
        description: packageDesc = "N/A",
        category_equipment = "N/A",
        capacity_equipment = 0,
        capacity_students = 0,
        package_type = "N/A",
        duration_minutes = 0,
        price_per_student = 0,
    } = school_package || {};

    const durationHours = duration_minutes / 60;
    const pph = duration_minutes !== 0 ? Math.round(price_per_student / durationHours) : 0;
    const isRental = package_type?.toLowerCase().includes("rental");

    const handleAction = async (newStatus: string) => {
        // If accepting, show confirmation modal
        if (newStatus === "accepted") {
            onAccept();
            return;
        }

        // For decline, just update status directly
        setIsPending(true);
        const result = await updateStudentPackageStatus(id, newStatus);
        if (result.success) {
            toast.success(`Request ${newStatus}`);
        } else {
            toast.error(result.error || "Failed to update request");
        }
        setIsPending(false);
    };

    const currentStatus = STUDENT_PACKAGE_REQUEST_STATUS_CONFIG[status as keyof typeof STUDENT_PACKAGE_REQUEST_STATUS_CONFIG] || {
        label: status,
        textColor: "text-zinc-400",
        hoverBg: "hover:bg-zinc-400",
    };

    return (
        <tr className="bg-white dark:bg-zinc-900 group relative transition-all border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700">
            {/* Package Column */}
            <td className="px-8 py-8 align-middle rounded-l-3xl border-y border-l border-zinc-100 dark:border-zinc-800 shadow-sm relative">
                <div className="flex flex-col gap-4">
                    <div className="pl-1">
                        {school_package?.id ? (
                            <Link
                                href={`/packages/${school_package.id}`}
                                className="font-black text-xl text-zinc-900 dark:text-white uppercase italic tracking-tighter leading-none block"
                                title="View Package Details"
                            >
                                {packageDesc}
                            </Link>
                        ) : (
                            <span className="font-black text-xl text-zinc-900 dark:text-white uppercase italic tracking-tighter leading-none block">
                                {packageDesc}
                            </span>
                        )}
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
            <InfoColumn
                top={
                    <>
                        <BookingIcon size={16} className="text-muted-foreground" />
                        <DateRangeBadge startDate={requested_date_start} endDate={requested_date_end} />
                    </>
                }
                bottom={
                    <>
                        <RequestIcon size={16} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Requested: {formatDate(created_at)}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                            {getRelativeDateLabel(created_at)}
                        </span>
                    </>
                }
            />

            {/* Clerk Column - Final Column with Status Badge */}
            <td className="px-6 py-8 align-bottom border-y border-zinc-100 dark:border-zinc-800 shadow-sm rounded-r-3xl border-r relative">
                <div className="flex flex-col gap-6 items-end text-right">
                    {/* Status Badge moved here to anchor to the right side of the row */}
                    <div className="absolute top-[-1px] right-[-1px] z-20">
                        <div
                            className={`bg-white dark:bg-zinc-900 px-8 py-3 rounded-bl-[2.5rem] rounded-tr-3xl border-b border-l border-zinc-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm transition-all duration-300 group/status ${currentStatus.hoverBg} hover:border-transparent cursor-default`}
                        >
                            <div className="flex items-center gap-3">
                                <Image
                                    src={adrLogo}
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="dark:invert opacity-70 transition-all duration-300 group-hover/status:invert group-hover/status:brightness-200 group-hover/status:opacity-100"
                                />
                                <span
                                    className={`text-sm font-black tracking-[0.4em] uppercase transition-colors duration-300 ${currentStatus.textColor} group-hover/status:text-white`}
                                >
                                    {currentStatus.label}
                                </span>
                            </div>

                            {status === "requested" && (
                                <div className="flex items-center gap-2 pl-6 border-l border-zinc-100 dark:border-zinc-800 pointer-events-auto transition-colors group-hover/status:border-white/20">
                                    <button
                                        onClick={() => handleAction("accepted")}
                                        disabled={isPending}
                                        className="p-1.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        {isPending ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Check size={14} strokeWidth={3} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleAction("rejected")}
                                        disabled={isPending}
                                        className="p-1.5 rounded-full bg-red-50 text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 h-7 pt-2">
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">
                            {invitation.student_name?.fullName || requested_clerk_id.slice(0, 14)}
                        </span>
                        <User size={16} className="text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-2 w-full justify-end pb-1">
                        <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${isRental ? "text-[rgb(var(--red-clade))]" : "text-[rgb(var(--blue-clude))]"}`}
                        >
                            {isRental ? "Rental" : "Lesson"}
                        </span>
                        <PackageIcon size={16} className="text-muted-foreground" />
                    </div>
                </div>
            </td>
        </tr>
    );
}
