"use client";

import { useState, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { SCHOOL_PACKAGE_STATUS_CONFIG, type SchoolPackageStatus } from "@/types/status";
import { updatePackageStatus } from "@/supabase/server/package-status";
import { Dropdown } from "@/src/components/ui/dropdown";
import toast from "react-hot-toast";

interface PackageStatusLabelProps {
    packageId: string;
    isActive: boolean;
}

export function PackageStatusLabel({ packageId, isActive }: PackageStatusLabelProps) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const status: SchoolPackageStatus = isActive ? "active" : "inactive";
    const config = SCHOOL_PACKAGE_STATUS_CONFIG[status];

    const handleStatusChange = async (newStatus: SchoolPackageStatus) => {
        if (newStatus === status) return;
        
        setIsPending(true);
        setIsOpen(false);
        
        const activeValue = newStatus === "active";
        const result = await updatePackageStatus(packageId, { active: activeValue });
        
        if (result.success) {
            toast.success(`Package marked as ${newStatus}`);
        } else {
            toast.error(result.error || "Failed to update status");
        }
        
        setIsPending(false);
    };

    const dropdownItems = [
        {
            label: "Active",
            icon: Check,
            onClick: () => handleStatusChange("active"),
            className: status === "active" ? "bg-accent" : "",
        },
        {
            label: "Inactive",
            icon: X,
            onClick: () => handleStatusChange("inactive"),
            className: status === "inactive" ? "bg-accent" : "",
        },
    ];

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${isPending ? "opacity-50 cursor-wait" : "hover:opacity-80"}`}
                style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    borderColor: `${config.color}30`
                }}
            >
                <span className="capitalize">{status}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                items={dropdownItems}
                triggerRef={triggerRef}
                align="end"
            />
        </div>
    );
}
