"use client";

import { useState, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { TEACHER_STATUS_CONFIG, type TeacherStatus } from "@/types/status";
import { updateTeacherStatus } from "@/supabase/server/teacher-status";
import { Dropdown } from "@/src/components/ui/dropdown";
import toast from "react-hot-toast";

interface TeacherStatusLabelProps {
    teacherId: string;
    isActive: boolean;
}

export function TeacherStatusLabel({ teacherId, isActive }: TeacherStatusLabelProps) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const status: TeacherStatus = isActive ? "active" : "inactive";
    const config = TEACHER_STATUS_CONFIG[status];

    const handleStatusChange = async (newStatus: TeacherStatus) => {
        if (newStatus === status) return;

        setIsPending(true);
        setIsOpen(false);

        const activeValue = newStatus === "active";
        const result = await updateTeacherStatus(teacherId, activeValue);

        if (result.success) {
            toast.success(`Teacher marked as ${newStatus}`);
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
                    borderColor: `${config.color}30`,
                }}
            >
                <span className="capitalize">{status}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} items={dropdownItems} triggerRef={triggerRef} align="right" />
        </div>
    );
}
