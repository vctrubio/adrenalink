"use client";

import { useState, useRef } from "react";
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react";
import { updatePackageStatus } from "@/supabase/server/package-status";
import { Dropdown } from "@/src/components/ui/dropdown";
import toast from "react-hot-toast";

interface PackagePublicLabelProps {
    packageId: string;
    isPublic: boolean;
}

export function PackagePublicLabel({ packageId, isPublic }: PackagePublicLabelProps) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handlePublicChange = async (newValue: boolean) => {
        if (newValue === isPublic) return;

        setIsPending(true);
        setIsOpen(false);

        const result = await updatePackageStatus(packageId, { is_public: newValue });

        if (result.success) {
            toast.success(`Package visibility set to ${newValue ? "Public" : "Private"}`);
        } else {
            toast.error(result.error || "Failed to update visibility");
        }

        setIsPending(false);
    };

    const dropdownItems = [
        {
            label: "Public",
            icon: Eye,
            onClick: () => handlePublicChange(true),
            className: isPublic ? "bg-accent" : "",
        },
        {
            label: "Private",
            icon: EyeOff,
            onClick: () => handlePublicChange(false),
            className: !isPublic ? "bg-accent" : "",
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
                    backgroundColor: isPublic ? "rgba(6, 182, 212, 0.1)" : "rgba(107, 114, 128, 0.1)",
                    color: isPublic ? "#0891b2" : "#4b5563",
                    borderColor: isPublic ? "rgba(6, 182, 212, 0.2)" : "rgba(107, 114, 128, 0.2)",
                }}
            >
                {isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{isPublic ? "Public" : "Private"}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} items={dropdownItems} triggerRef={triggerRef} align="right" />
        </div>
    );
}
