"use client";

import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";

const EVENT_STATUSES: EventStatus[] = ["planned", "tbc", "completed", "uncompleted"];

interface EventStatusLabelProps {
    status: EventStatus;
    onStatusChange: (newStatus: EventStatus) => Promise<void>;
    onDelete: (cascade: boolean) => void;
    isDeleting?: boolean;
    isUpdating?: boolean;
    canShiftQueue?: boolean;
    icon?: React.ComponentType<{ size?: number }>;
    capacity?: number;
    className?: string;
}

export function EventStatusLabel({
    status,
    onStatusChange,
    onDelete,
    isDeleting = false,
    isUpdating = false,
    canShiftQueue = false,
    icon: Icon,
    capacity = 0,
    className = "",
}: EventStatusLabelProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

    const statusConfig = EVENT_STATUS_CONFIG[status] || EVENT_STATUS_CONFIG.planned;

    const handleStatusChange = async (statusOption: EventStatus) => {
        setIsStatusUpdating(true);
        try {
            await onStatusChange(statusOption);
        } finally {
            setIsStatusUpdating(false);
            setIsDropdownOpen(false);
        }
    };

    const dropdownItems: DropdownItemProps[] = [
        ...EVENT_STATUSES.map((statusOption) => ({
            id: statusOption,
            label: statusOption,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[statusOption].color }} />,
            color: EVENT_STATUS_CONFIG[statusOption].color,
            onClick: () => {
                handleStatusChange(statusOption);
            },
        })),
        ...(canShiftQueue
            ? [
                  {
                      id: "delete-cascade",
                      label: isDeleting ? "Deleting..." : "Delete & Optimize",
                      icon: Trash2,
                      color: "#ef4444",
                      onClick: () => {
                          onDelete(true);
                          setIsDropdownOpen(false);
                      },
                  },
              ]
            : []),
        {
            id: "delete",
            label: isDeleting ? "Deleting..." : "Delete",
            icon: Trash2,
            color: "#ef4444",
            onClick: () => {
                onDelete(false);
                setIsDropdownOpen(false);
            },
        },
    ];

    return (
        <div className={`relative ${className}`}>
            <button
                ref={dropdownTriggerRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isStatusUpdating}
                className={`w-12 h-12 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors border border-border relative`}
                style={{ color: statusConfig.color }}
            >
                {/* Glow pulse ring - from icon outward */}
                {(isUpdating || isStatusUpdating) && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: statusConfig.color }}
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                )}

                {/* Icon with smooth scale pulse */}
                <motion.div
                    animate={isUpdating || isStatusUpdating ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 2, repeat: isUpdating || isStatusUpdating ? Infinity : 0, ease: "easeInOut" }}
                >
                    {Icon ? (
                        <Icon size={24} />
                    ) : (
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                    )}
                </motion.div>

                {/* Capacity Badge */}
                {capacity > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white shadow-sm border border-border/50">
                        x{capacity}
                    </span>
                )}
            </button>
            <Dropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                items={dropdownItems}
                align="right"
                initialFocusedId={status}
                triggerRef={dropdownTriggerRef}
            />
        </div>
    );
}
