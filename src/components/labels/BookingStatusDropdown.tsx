"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";
import { updateBookingStatus } from "@/supabase/server/booking-id";

const BOOKING_STATUSES: BookingStatus[] = ["active", "completed", "uncompleted"];

interface BookingStatusDropdownProps {
    bookingId: string;
    currentStatus: string;
    dateStart?: string;
    dateEnd?: string;
    size?: number;
    className?: string;
    children?: React.ReactNode;
    iconOnly?: boolean;
}

export function BookingStatusDropdown({ 
    bookingId, 
    currentStatus, 
    dateStart,
    dateEnd,
    size = 14,
    className = "",
    children,
    iconOnly = false
}: BookingStatusDropdownProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    
    const statusConfig = BOOKING_STATUS_CONFIG[currentStatus as BookingStatus];
    const statusColor = statusConfig?.color || "#3b82f6";

    // Date Logic - Only run if not in iconOnly mode
    let formattedDate = "";
    let diffDays = 0;
    
    if (!iconOnly && dateStart && dateEnd) {
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        formattedDate = start.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    }

    const handleStatusChange = async (newStatus: string) => {
        const res = await updateBookingStatus(bookingId, newStatus);
        if (res.success) {
            router.refresh();
        }
        setIsDropdownOpen(false);
    };

    const statusDropdownItems: DropdownItemProps[] = BOOKING_STATUSES.map(s => {
        const config = BOOKING_STATUS_CONFIG[s];
        return {
            id: s,
            label: config.label,
            icon: () => (
                <div style={{ color: config.color }}>
                    <BookingIcon size={size} />
                </div>
            ),
            color: config.color,
            onClick: () => handleStatusChange(s)
        };
    });

    return (
        <div className={`relative flex items-center ${className}`}>
            <button 
                ref={dropdownTriggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                }}
                className="shrink-0 flex items-center gap-2 p-1 rounded hover:bg-muted/50 transition-colors group"
            >
                <div style={{ color: statusColor }} className="group-hover:scale-125 transition-transform duration-200 flex items-center">
                    <BookingIcon size={size} />
                </div>
                
                {!iconOnly && (
                    <>
                        <span className="font-bold text-foreground text-xs whitespace-nowrap">{formattedDate}</span>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-black text-[9px] whitespace-nowrap uppercase">
                            {diffDays === 0 ? "Single" : `+${diffDays}`}
                        </span>
                    </>
                )}

                {children}
            </button>
            
            <Dropdown 
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                items={statusDropdownItems}
                align="left"
                triggerRef={dropdownTriggerRef}
            />
        </div>
    );
}
