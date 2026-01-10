"use client";

import { useState, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { SCHOOL_STUDENT_STATUS_CONFIG, type SchoolStudentStatus } from "@/types/status";
import { updateSchoolStudentStatus } from "@/supabase/server/student-status";
import { Dropdown } from "@/src/components/ui/dropdown";
import toast from "react-hot-toast";

interface SchoolStudentStatusLabelProps {
    studentId: string;
    status: SchoolStudentStatus;
    description: string | null;
}

export function SchoolStudentStatusLabel({ studentId, status, description }: SchoolStudentStatusLabelProps) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const config = SCHOOL_STUDENT_STATUS_CONFIG[status];
    const displayLabel = description || config.label;

    const handleStatusChange = async (newStatus: SchoolStudentStatus) => {
        if (newStatus === status) return;

        setIsPending(true);
        setIsOpen(false);

        const isActive = newStatus === "active";
        const result = await updateSchoolStudentStatus(studentId, isActive);

        if (result.success) {
            toast.success(`Student marked as ${newStatus}`);
        } else {
            toast.error(result.error || "Failed to update status");
        }

        setIsPending(false);
    };

    const dropdownItems = (Object.keys(SCHOOL_STUDENT_STATUS_CONFIG) as SchoolStudentStatus[]).map((statusKey) => ({
        label: SCHOOL_STUDENT_STATUS_CONFIG[statusKey].label,
        icon: statusKey === "active" ? Check : X,
        onClick: () => handleStatusChange(statusKey),
        className: status === statusKey ? "bg-accent" : "",
    }));

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
                    borderColor: `${config.color}30`,
                }}
            >
                <span className="truncate max-w-[150px]">{displayLabel}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} items={dropdownItems} triggerRef={triggerRef} align="right" />
        </div>
    );
}
