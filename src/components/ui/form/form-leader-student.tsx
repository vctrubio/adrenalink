"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Student {
    id: string;
    first_name: string;
    last_name: string;
}

interface FormLeaderStudentProps {
    value: string; // leader_student_name
    students: Student[];
    onChange: (studentName: string) => void;
    disabled?: boolean;
    error?: boolean;
}

const FormLeaderStudent = forwardRef<HTMLDivElement, FormLeaderStudentProps>(
    ({ value, students, onChange, disabled = false, error = false }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const selectedStudent = students.find((s) => `${s.first_name} ${s.last_name}` === value);

        return (
            <div ref={ref} className="relative" {...(dropdownRef as any)}>
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full h-10 px-3 pr-8 rounded-lg border transition-colors text-sm text-left
                        bg-background text-foreground
                        ${error ? "border-destructive/50 focus:ring-destructive/20" : "border-input focus:ring-ring focus:border-ring"}
                        focus:outline-none focus:ring-2 focus:ring-opacity-20
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-between
                    `}
                >
                    <span className={value ? "text-foreground" : "text-muted-foreground"}>
                        {value || "Select leader student..."}
                    </span>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Image
                            src="/appSvgs/DropdownBullsIcon.svg"
                            alt=""
                            width={16}
                            height={16}
                            className="text-muted-foreground"
                            style={{
                                filter: "brightness(0) saturate(100%) invert(45%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(60%) contrast(90%)",
                            }}
                        />
                    </div>
                </button>

                <AnimatePresence>
                    {isOpen && students.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                            className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl z-[100] py-1.5 overflow-hidden"
                        >
                            {students.map((student) => {
                                const studentName = `${student.first_name} ${student.last_name}`;
                                const isSelected = studentName === value;

                                return (
                                    <button
                                        key={student.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(studentName);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full px-3 py-2 text-left text-sm transition-colors
                                            flex items-center justify-between hover:bg-muted
                                            ${isSelected ? "text-primary bg-primary/5 font-medium" : "text-foreground"}
                                        `}
                                    >
                                        <span>{studentName}</span>
                                        {isSelected && <Check size={14} strokeWidth={3} />}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    },
);

FormLeaderStudent.displayName = "FormLeaderStudent";

export default FormLeaderStudent;
