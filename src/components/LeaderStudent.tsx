"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";
import type { StudentData } from "@/types/classboard-teacher-queue";

interface LeaderStudentProps {
    leaderStudentName?: string;
    bookingId: string;
    bookingStudents: { id: string; firstName: string; lastName: string }[];
    variant?: "default" | "minimal";
}

const ICON_SIZE = 20;

export const LeaderStudent = ({ 
    leaderStudentName, 
    bookingId, 
    bookingStudents,
    variant = "default"
}: LeaderStudentProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const studentColor = studentEntity?.color;
    const displayName = leaderStudentName || "Booking abc";
    const hasStudents = bookingStudents.length > 0;
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

    const isMinimal = variant === "minimal";

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`flex items-center transition-colors group/leader ${
                    isMinimal 
                        ? "px-1 py-0.5 rounded-md hover:bg-muted/50" 
                        : "px-3 py-2 text-base rounded-lg"
                }`}
                style={!isMinimal ? { backgroundColor: `${studentColor}15` } : {}}
                onMouseEnter={(e) => {
                    if (!isMinimal) e.currentTarget.style.backgroundColor = `${studentColor}25`;
                }}
                onMouseLeave={(e) => {
                    if (!isMinimal) e.currentTarget.style.backgroundColor = `${studentColor}15`;
                }}
            >
                {!isMinimal && (
                    <div className="mr-1.5" style={{ color: studentColor }}>
                        <HelmetIcon size={ICON_SIZE} />
                    </div>
                )}
                <span className={`${isMinimal ? "text-sm font-bold text-foreground" : "font-medium"} whitespace-nowrap max-w-[200px] overflow-x-auto`}>
                    {displayName}
                </span>
                {hasMultipleStudents && (
                    <span className={`font-black ${
                        isMinimal 
                            ? "text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground ml-2 shadow-sm" 
                            : "ml-1 text-muted-foreground"
                    }`}>
                        +{bookingStudents.length - 1}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {hasStudents && isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bg-card border border-border rounded-lg shadow-lg z-50 min-w-[220px] overflow-hidden"
                        style={{ top: `${dropdownRect.top}px`, left: `${dropdownRect.left}px` }}
                    >
                        {bookingStudents.map((student) => (
                            <Link
                                key={student.id}
                                href={`/students/${student.id}`}
                                prefetch={false}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors block"
                            >
                                <HelmetIcon size={16} />
                                <span>
                                    {student.firstName} {student.lastName}
                                </span>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
