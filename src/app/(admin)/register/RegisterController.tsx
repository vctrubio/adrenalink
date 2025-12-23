"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";
import { SchoolHeader } from "./controller-sections/SchoolHeader";
import { FormSelector } from "./controller-sections/FormSelector";
import { StudentSummary } from "./controller-sections/StudentSummary";
import { TeacherSummary } from "./controller-sections/TeacherSummary";
import { PackageSummary } from "./controller-sections/PackageSummary";
import { BookingSummary } from "./controller-sections/BookingSummary";
import { ControllerActions } from "./controller-sections/ControllerActions";
import {
    useRegisterQueues,
    useBookingForm,
    useStudentFormState,
    useTeacherFormState,
    usePackageFormState
} from "./RegisterContext";
import RegisterQueue from "./RegisterQueue";

type FormType = "booking" | "student" | "package" | "teacher";

interface RegisterControllerProps {
    activeForm: FormType;
    selectedPackage: any;
    selectedStudents: any[];
    selectedReferral: any;
    selectedTeacher: any;
    selectedCommission: any;
    dateRange: { startDate: string; endDate: string };
    onReset: () => void;
    loading: boolean;
    school: any;
    isMobile?: boolean;
    error?: string | null;
    leaderStudentId?: string;
    onLeaderStudentChange?: (studentId: string) => void;
    submitHandler?: () => Promise<void>;
    isFormValid?: boolean;
}

export default function RegisterController({
    activeForm,
    selectedPackage,
    selectedStudents,
    selectedReferral,
    selectedTeacher,
    selectedCommission,
    dateRange,
    onReset,
    loading,
    school,
    isMobile = false,
    error = null,
    leaderStudentId = "",
    onLeaderStudentChange,
    submitHandler,
    isFormValid = false,
}: RegisterControllerProps) {
    const [isLeaderDropdownOpen, setIsLeaderDropdownOpen] = useState(false);
    const leaderDropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const bookingForm = useBookingForm();

    // Form state from context
    const { form: studentFormData } = useStudentFormState();
    const { form: teacherFormData } = useTeacherFormState();
    const { form: packageFormData } = usePackageFormState();

    // Use context leader student change if not provided
    const handleLeaderStudentChange = (studentId: string) => {
        if (onLeaderStudentChange) {
            onLeaderStudentChange(studentId);
        } else {
            bookingForm.setForm({ leaderStudentId: studentId });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (leaderDropdownRef.current && !leaderDropdownRef.current.contains(event.target as Node)) {
                setIsLeaderDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLeaderStudent = selectedStudents.find((s) => s.id === leaderStudentId);
    const leaderStudentName = selectedLeaderStudent ? `${selectedLeaderStudent.firstName} ${selectedLeaderStudent.lastName}` : "";

    // Internal loading state for generic submissions
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Generic submit action
    const handleActionSubmit = async () => {
        if (submitHandler) {
            setIsSubmitting(true);
            try {
                await submitHandler();
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const isActionLoading = loading || isSubmitting;

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
                            onSubmit={handleActionSubmit} 
                            onReset={onReset} 
                            loading={isActionLoading} 
                            canSubmit={isFormValid} 
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
                            onSubmit={handleActionSubmit} 
                            onReset={onReset} 
                            loading={isActionLoading} 
                            canSubmit={isFormValid} 
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
                            onSubmit={handleActionSubmit} 
                            onReset={onReset} 
                            loading={isActionLoading} 
                            canSubmit={isFormValid} 
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
                        />
                        {selectedStudents.length > 0 && (
                            <div className="border-t border-border pt-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Booking Leader</h3>
                                <div ref={leaderDropdownRef} className="relative">
                                    <button onClick={() => setIsLeaderDropdownOpen(!isLeaderDropdownOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm">
                                        <div className="flex items-center gap-2">
                                            {leaderStudentName && (
                                                <>
                                                    <HelmetIcon size={16} />
                                                    <span className="font-medium">{leaderStudentName}</span>
                                                </>
                                            )}
                                            {!leaderStudentName && <span className="text-muted-foreground text-xs">Select leader student</span>}
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
                                                                handleLeaderStudentChange(student.id);
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
                            onSubmit={handleActionSubmit} 
                            onReset={onReset} 
                            loading={isActionLoading} 
                            canSubmit={isFormValid} 
                            submitLabel={selectedTeacher && selectedCommission ? "Create Booking with Lesson" : "Create Booking"} 
                            resetLabel="Reset" 
                            error={error} 
                        />
                    </div>
                )}

                {/* Queue - Always show below everything */}
                <RegisterQueue />
            </div>
        </div>
    );
}
