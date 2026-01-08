"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import BookingIcon from "@/public/appSvgs/BookingIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

import { useBookingForm, useStudentFormState, useTeacherFormState, usePackageFormState } from "./RegisterContext";
import RegisterQueue from "./RegisterQueue";

import { StudentSummary } from "./controller-sections/StudentSummary";
import { TeacherSummary } from "./controller-sections/TeacherSummary";
import { PackageSummary } from "./controller-sections/PackageSummary";
import { BookingSummary } from "./controller-sections/BookingSummary";
import { ControllerActions } from "./controller-sections/ControllerActions";

type FormType = "booking" | "student" | "package" | "teacher";

interface RegisterControllerProps {
    school: any;
    activeForm: FormType;
    selectedPackage: any;
    selectedStudents: any[];
    selectedReferral: any;
    selectedTeacher: any;
    selectedCommission: any;
    dateRange: { startDate: string; endDate: string };
    onReset: () => void;
    loading: boolean;
    isMobile?: boolean;
    error?: string | null;
    leaderStudentId?: string;
    onLeaderStudentChange?: (studentId: string) => void;
    submitHandler?: () => Promise<void>;
    isFormValid?: boolean;
    referrals?: any[];
}

export default function RegisterController({
    school,
    activeForm,
    selectedPackage,
    selectedStudents,
    selectedReferral,
    selectedTeacher,
    selectedCommission,
    dateRange,
    onReset,
    loading,
    isMobile = false,
    error = null,
    leaderStudentId = "",
    onLeaderStudentChange,
    submitHandler,
    isFormValid = false,
    referrals,
}: RegisterControllerProps) {
    const router = useRouter();
    const bookingForm = useBookingForm();
    
    // Use school from props
    const displaySchool = school;
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state from context
    const { form: studentFormData } = useStudentFormState();
    const { form: teacherFormData } = useTeacherFormState();
    const { form: packageFormData } = usePackageFormState();

    const handleLeaderStudentChange = (studentId: string) => {
        if (onLeaderStudentChange) {
            onLeaderStudentChange(studentId);
        } else {
            bookingForm.setForm({ leaderStudentId: studentId });
        }
    };

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

    const tabs = [
        { id: "booking", label: "Booking", icon: BookingIcon, path: "/register" },
        { id: "student", label: "Student", icon: HelmetIcon, path: "/register/student" },
        { id: "package", label: "Package", icon: PackageIcon, path: "/register/package" },
        { id: "teacher", label: "Teacher", icon: HeadsetIcon, path: "/register/teacher" },
    ];

    const isActionLoading = loading || isSubmitting;

    return (
        <div className={`flex flex-col gap-6 ${isMobile ? "" : "lg:sticky lg:top-6"}`}>
            {/* 1. School Header Card */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm relative group">
                <div className="p-8 pb-10 bg-muted/20 border-b border-border relative overflow-hidden">
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm ring-4 ring-black/[0.02] overflow-hidden">
                                <Image 
                                    src="/ADR.webp" 
                                    alt="School Logo" 
                                    width={56} 
                                    height={56} 
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase leading-none">
                                    {displaySchool.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                        @{displaySchool.username}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                        {displaySchool.currency || "EUR"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Background Brand Watermark */}
                    <AdranlinkIcon className="absolute -bottom-10 -right-10 w-40 h-40 opacity-[0.03] text-primary rotate-12 pointer-events-none" />
                </div>

                {/* 2. Navigation Tabs */}
                <div className="px-6 -mt-6">
                    <div className="bg-card border border-border p-1.5 rounded-3xl shadow-lg flex items-center gap-1 relative z-20">
                        {tabs.map((tab) => {
                            const isActive = activeForm === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => router.push(tab.path)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 relative ${
                                        isActive 
                                        ? "text-primary" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Icon size={18} className="relative z-10" />
                                    <span className="text-[9px] font-black uppercase tracking-widest relative z-10">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Content Area */}
                <div className="p-8 pt-10 space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeForm}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-6">
                                {activeForm === "student" && studentFormData && (
                                    <>
                                        <StudentSummary studentFormData={studentFormData} />
                                        <ControllerActions onSubmit={handleActionSubmit} onReset={onReset} loading={isActionLoading} canSubmit={isFormValid} submitLabel="Register Student" resetLabel="Clear Form" error={error} />
                                    </>
                                )}

                                {activeForm === "teacher" && teacherFormData && (
                                    <>
                                        <TeacherSummary teacherFormData={teacherFormData} />
                                        <ControllerActions onSubmit={handleActionSubmit} onReset={onReset} loading={isActionLoading} canSubmit={isFormValid} submitLabel="Register Teacher" resetLabel="Clear Form" error={error} />
                                    </>
                                )}

                                {activeForm === "package" && packageFormData && (
                                    <>
                                        <PackageSummary packageFormData={packageFormData} />
                                        <ControllerActions onSubmit={handleActionSubmit} onReset={onReset} loading={isActionLoading} canSubmit={isFormValid} submitLabel="Create Package" resetLabel="Clear Form" error={error} />
                                    </>
                                )}

                                {activeForm === "booking" && (
                                    <div className="space-y-8">
                                        <BookingSummary
                                            dateRange={dateRange}
                                            selectedPackage={selectedPackage}
                                            selectedStudents={selectedStudents}
                                            selectedReferral={selectedReferral}
                                            selectedTeacher={selectedTeacher}
                                            selectedCommission={selectedCommission}
                                            hasReferrals={referrals && referrals.length > 0}
                                            leaderStudentId={leaderStudentId}
                                            onLeaderStudentChange={handleLeaderStudentChange}
                                        />

                                        <ControllerActions
                                            onSubmit={handleActionSubmit}
                                            onReset={onReset}
                                            loading={isActionLoading}
                                            canSubmit={isFormValid}
                                            submitLabel={selectedTeacher && selectedCommission ? "Register Lesson" : "Register Booking"}
                                            resetLabel="Reset All"
                                            error={error}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Static Queue Section */}
                    <RegisterQueue />
                </div>
            </div>
        </div>
    );
}
