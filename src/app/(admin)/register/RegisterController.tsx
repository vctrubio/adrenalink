"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StudentFormData } from "@/src/components/forms/Student4SchoolForm";
import type { TeacherFormData } from "@/src/components/forms/Teacher4SchoolForm";
import type { PackageFormData } from "@/src/components/forms/Package4SchoolForm";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { SchoolHeader } from "./controller-sections/SchoolHeader";
import { FormSelector } from "./controller-sections/FormSelector";
import { StudentSummary } from "./controller-sections/StudentSummary";
import { TeacherSummary } from "./controller-sections/TeacherSummary";
import { PackageSummary } from "./controller-sections/PackageSummary";
import { BookingSummary } from "./controller-sections/BookingSummary";
import { ControllerActions } from "./controller-sections/ControllerActions";

type FormType = "booking" | "student" | "package" | "teacher";

interface RegisterControllerProps {
    activeForm: FormType;
    selectedPackage: any;
    selectedStudents: any[];
    selectedReferral: any;
    selectedTeacher: any;
    selectedCommission: any;
    dateRange: { startDate: string; endDate: string };
    onSubmit: () => void;
    onReset: () => void;
    onScrollToSection: (sectionId: string) => void;
    loading: boolean;
    canCreateBooking: boolean;
    school: any;
    isMobile?: boolean;
    studentFormData?: StudentFormData | null;
    teacherFormData?: TeacherFormData | null;
    packageFormData?: PackageFormData | null;
    error?: string | null;
    leaderStudentId?: string;
    onLeaderStudentChange?: (studentId: string) => void;
}

export default function RegisterController({
    activeForm,
    selectedPackage,
    selectedStudents,
    selectedReferral,
    selectedTeacher,
    selectedCommission,
    dateRange,
    onSubmit,
    onReset,
    onScrollToSection,
    loading,
    canCreateBooking,
    school,
    isMobile = false,
    studentFormData = null,
    teacherFormData = null,
    packageFormData = null,
    error = null,
    leaderStudentId = "",
    onLeaderStudentChange,
}: RegisterControllerProps) {
    const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
    const leaderDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (leaderDropdownRef.current && !leaderDropdownRef.current.contains(event.target as Node)) {
                setIsLeaderDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLeaderStudent = selectedStudents.find(s => s.id === leaderStudentId);
    const leaderStudentName = selectedLeaderStudent ? `${selectedLeaderStudent.firstName} ${selectedLeaderStudent.lastName}` : "";

    return (
        <div className={`bg-card ${isMobile ? "rounded-lg border border-border" : "lg:sticky lg:top-4"}`}>
            <div className="p-6 space-y-6">
                {/* School Header */}
                <SchoolHeader school={school} />

                {/* Form Selector */}
                <FormSelector activeForm={activeForm} />

                {/* Student Form Summary */}
                {activeForm === "student" && studentFormData && (
                    <div className="space-y-4">
                        <StudentSummary studentFormData={studentFormData} />
                        <ControllerActions
                            onSubmit={onSubmit}
                            onReset={onReset}
                            loading={loading}
                            canSubmit={canCreateBooking}
                            submitLabel="Create Student"
                            resetLabel="Cancel"
                            error={error}
                        />
                    </div>
                )}

                {/* Teacher Form Summary */}
                {activeForm === "teacher" && teacherFormData && (
                    <div className="space-y-4">
                        <TeacherSummary teacherFormData={teacherFormData} />
                        <ControllerActions
                            onSubmit={onSubmit}
                            onReset={onReset}
                            loading={loading}
                            canSubmit={canCreateBooking}
                            submitLabel="Create Teacher"
                            resetLabel="Cancel"
                            error={error}
                        />
                    </div>
                )}

                {/* Package Form Summary */}
                {activeForm === "package" && packageFormData && (
                    <div className="space-y-4">
                        <PackageSummary packageFormData={packageFormData} />
                        <ControllerActions
                            onSubmit={onSubmit}
                            onReset={onReset}
                            loading={loading}
                            canSubmit={canCreateBooking}
                            submitLabel="Create Package"
                            resetLabel="Cancel"
                            error={error}
                        />
                    </div>
                )}

                {/* Booking Form Summary */}
                {activeForm === "booking" && (
                    <div className="space-y-4">
                        <BookingSummary
                            dateRange={dateRange}
                            selectedPackage={selectedPackage}
                            selectedStudents={selectedStudents}
                            selectedReferral={selectedReferral}
                            selectedTeacher={selectedTeacher}
                            selectedCommission={selectedCommission}
                            onScrollToSection={onScrollToSection}
                        />
                        {selectedStudents.length > 0 && (
                            <div className="border-t border-border pt-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Booking Leader</h3>
                                <div ref={leaderDropdownRef} className="relative">
                                    <button
                                        onClick={() => setIsLeaderDropdownOpen(!isLeaderDropdownOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            {leaderStudentName && (
                                                <>
                                                    <HelmetIcon size={16} />
                                                    <span className="font-medium">{leaderStudentName}</span>
                                                </>
                                            )}
                                            {!leaderStudentName && (
                                                <span className="text-muted-foreground text-xs">Select leader student</span>
                                            )}
                                        </div>
                                        <motion.div animate={{ rotate: isLeaderDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <AdranlinkIcon className="w-4 h-4" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isLeaderDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                                            >
                                                {selectedStudents.map((student) => {
                                                    const isActive = student.id === leaderStudentId;
                                                    return (
                                                        <button
                                                            key={student.id}
                                                            onClick={() => {
                                                                onLeaderStudentChange?.(student.id);
                                                                setIsLeaderDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
                                                        >
                                                            {student.firstName} {student.lastName}
                                                        </button>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        <ControllerActions
                            onSubmit={onSubmit}
                            onReset={onReset}
                            loading={loading}
                            canSubmit={canCreateBooking}
                            submitLabel="Create Booking"
                            resetLabel="Reset"
                            error={error}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
