"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";
import type { StudentData } from "@/types/classboard-teacher-queue";

interface LeaderStudentProps {
    leaderStudentName?: string;
    bookingId: string;
    bookingStudents: StudentData[];
}

const ICON_SIZE = 20;

export const LeaderStudent = ({ leaderStudentName, bookingId, bookingStudents }: LeaderStudentProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const studentColor = studentEntity?.color;
    const displayName = leaderStudentName || `Booking ${bookingId.slice(0, 8)}`;
    const hasMultipleStudents = bookingStudents.length > 1;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isDropdownOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownRect({
                top: rect.bottom + 8,
                left: rect.left,
            });
        }
    }, [isDropdownOpen]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-base rounded-lg transition-colors"
                style={{ backgroundColor: `${studentColor}15` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${studentColor}25`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${studentColor}15`)}
            >
                <div style={{ color: studentColor }}>
                    <HelmetIcon size={ICON_SIZE} />
                </div>
                <span className="font-medium whitespace-nowrap max-w-[200px] overflow-x-auto">{displayName}</span>
                {hasMultipleStudents && <span className="ml-1 text-muted-foreground">+{bookingStudents.length - 1}</span>}
            </button>

            <AnimatePresence>
                {hasMultipleStudents && isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bg-card border border-border rounded-lg shadow-lg z-50 min-w-[220px] overflow-hidden"
                        style={{ top: `${dropdownRect.top}px`, left: `${dropdownRect.left}px` }}
                    >
                        {bookingStudents.map((student) => (
                            <div key={student.id} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                                <HelmetIcon size={16} />
                                <span>{student.firstName} {student.lastName}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
