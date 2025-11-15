"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { masterBookingAdd } from "@/actions/register-action";
import { showEntityToast } from "@/getters/toast-getter";
import { prettyDateSpan } from "@/getters/date-getter";
import RegisterController from "./RegisterController";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";
import { DateSection } from "./booking-sections/DateSection";
import { PackageSection } from "./booking-sections/PackageSection";
import { StudentsSection } from "./booking-sections/StudentsSection";
import { ReferralSection } from "./booking-sections/ReferralSection";
import { TeacherSection } from "./booking-sections/TeacherSection";

type SectionId = "dates-section" | "package-section" | "students-section" | "referral-section" | "teacher-section" | "commission-section";

interface BookingFormProps {
    school: any;
    schoolPackages: any[];
    students: any[];
    teachers: any[];
    referrals: any[];
}

export default function BookingForm({ school, schoolPackages, students, teachers, referrals }: BookingFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentIdParam = searchParams.get("studentId");

    // State
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
        studentIdParam ? [studentIdParam] : []
    );
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [selectedCommission, setSelectedCommission] = useState<any>(null);
    const [selectedReferral, setSelectedReferral] = useState<any>(null);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
        () => new Set(studentIdParam ? ["package-section", "teacher-section", "commission-section"] : ["dates-section", "package-section", "students-section", "referral-section", "teacher-section", "commission-section"])
    );

    // If studentId param exists, set package capacity to 1
    useEffect(() => {
        if (studentIdParam && selectedPackage && selectedPackage.capacityStudents !== 1) {
            // Find single-student packages
            const singlePackage = schoolPackages.find(pkg => pkg.capacityStudents === 1);
            if (singlePackage) {
                setSelectedPackage(singlePackage);
            }
        }
    }, [studentIdParam, schoolPackages]);

    const selectedStudentsList = students
        .map(ss => ss.student)
        .filter((student: any) => selectedStudentIds.includes(student.id));

    const selectedStudents = selectedStudentsList;

    const canCreateBooking =
        selectedPackage &&
        selectedStudentIds.length > 0 &&
        selectedStudentIds.length === selectedPackage.capacityStudents &&
        dateRange.startDate &&
        dateRange.endDate &&
        // If teacher is selected, commission must also be selected
        (!selectedTeacher || selectedCommission);

    const toggleSection = useCallback((sectionId: SectionId) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    }, []);

    const closeSection = useCallback((sectionId: SectionId) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            newSet.delete(sectionId);
            return newSet;
        });
    }, []);

    const handlePackageSelect = (pkg: any) => {
        setSelectedPackage(pkg);
        closeSection("package-section");
    };

    const handleStudentToggle = (studentId: string) => {
        setSelectedStudentIds((prev) => {
            if (prev.includes(studentId)) {
                return prev.filter((id) => id !== studentId);
            }
            // If package is selected, enforce capacity limit
            if (selectedPackage && prev.length >= selectedPackage.capacityStudents) {
                setError(`Maximum ${selectedPackage.capacityStudents} students for this package`);
                setTimeout(() => setError(null), 3000);
                return prev;
            }
            const newIds = [...prev, studentId];
            // Auto-close section if capacity is met
            if (selectedPackage && newIds.length === selectedPackage.capacityStudents) {
                closeSection("students-section");
            }
            return newIds;
        });
    };

    const handleTeacherSelect = (teacher: any) => {
        setSelectedTeacher(teacher);
        // Auto-select first commission if only one exists
        if (teacher.commissions && teacher.commissions.length === 1) {
            setSelectedCommission(teacher.commissions[0]);
        } else {
            setSelectedCommission(null);
        }
    };

    const handleCommissionSelect = (commission: any) => {
        setSelectedCommission(commission);
    };

    const handleReferralSelect = (referral: any | null) => {
        setSelectedReferral(referral);
        if (referral) {
            closeSection("referral-section");
        }
    };

    const handleAddCommission = async (teacherId: string, commissionData: any) => {
        // TODO: Implement actual API call to save commission
        // For now, just create a temporary commission object
        const newCommission = {
            id: Date.now().toString(),
            ...commissionData,
        };
        
        // Update the teacher's commissions in local state
        const updatedTeacher = {
            ...selectedTeacher,
            commissions: [...(selectedTeacher?.commissions || []), newCommission],
        };
        
        setSelectedTeacher(updatedTeacher);
        setSelectedCommission(newCommission);
        
        // TODO: Show success message
        alert("Commission added! (Note: This is temporary - needs backend integration)");
    };

    const handleScrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            // Expand the section
            setExpandedSections((prev) => {
                const newSet = new Set(prev);
                newSet.add(sectionId as SectionId);
                return newSet;
            });
        }
    };

    const scrollToSection = handleScrollToSection;

    const handleReset = () => {
        setSelectedPackage(null);
        setSelectedStudentIds(studentIdParam ? [studentIdParam] : []);
        setSelectedTeacher(null);
        setSelectedCommission(null);
        setSelectedReferral(null);
        setDateRange({ startDate: "", endDate: "" });
        setExpandedSections(new Set(["dates-section", "package-section", "students-section", "referral-section", "teacher-section", "commission-section"]));
        setError(null);
        if (!studentIdParam) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("BOOKING FORM: Submitting booking...", {
                packageId: selectedPackage.id,
                studentIds: selectedStudentIds,
                dateStart: dateRange.startDate,
                dateEnd: dateRange.endDate,
                teacherId: selectedTeacher?.id,
                commissionId: selectedCommission?.id,
            });

            const result = await masterBookingAdd(
                selectedPackage.id,
                selectedStudentIds,
                dateRange.startDate,
                dateRange.endDate,
                selectedTeacher?.id,
                selectedCommission?.id,
                selectedReferral?.id
            );

            console.log("BOOKING FORM: Result from masterBookingAdd:", result);

            if (!result.success) {
                const errorMessage = result.error || "Failed to create booking";
                console.error("BOOKING FORM: Error creating booking:", errorMessage);
                setError(errorMessage);
                showEntityToast("booking", {
                    title: "Booking Error",
                    description: errorMessage,
                    duration: 5000,
                });
                setLoading(false);
                return;
            }

            // Success - show toast and reset
            showEntityToast("booking", {
                title: "Booking Created",
                description: prettyDateSpan(dateRange.startDate, dateRange.endDate),
                duration: 4000,
            });
            handleReset();
            router.refresh();
            setLoading(false);
        } catch (err) {
            const errorMessage = "An unexpected error occurred";
            setError(errorMessage);
            showEntityToast("booking", {
                title: "Booking Error",
                description: errorMessage,
                duration: 5000,
            });
            setLoading(false);
        }
    };

    return (
        <RegisterFormLayout
            controller={
                <RegisterController
                    activeForm="booking"
                    selectedPackage={selectedPackage}
                    selectedStudents={selectedStudents}
                    selectedReferral={selectedReferral}
                    selectedTeacher={selectedTeacher}
                    selectedCommission={selectedCommission}
                    dateRange={dateRange}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    onScrollToSection={scrollToSection}
                    loading={loading}
                    canCreateBooking={canCreateBooking}
                    school={school}
                />
            }
            form={
                <div className="space-y-6">
                    <DateSection
                        dateRange={dateRange}
                        onDateChange={(field, value) => setDateRange(prev => ({ ...prev, [field]: value }))}
                        isExpanded={expandedSections.has("dates-section")}
                        onToggle={() => toggleSection("dates-section")}
                    />

                    <PackageSection
                        packages={schoolPackages}
                        selectedPackage={selectedPackage}
                        onSelect={handlePackageSelect}
                        isExpanded={expandedSections.has("package-section")}
                        onToggle={() => toggleSection("package-section")}
                        selectedStudentCount={selectedStudentIds.length}
                    />

                    <StudentsSection
                        students={students}
                        selectedStudentIds={selectedStudentIds}
                        onToggle={handleStudentToggle}
                        preSelectedId={studentIdParam}
                        isExpanded={expandedSections.has("students-section")}
                        onSectionToggle={() => toggleSection("students-section")}
                    />

                    <ReferralSection
                        referrals={referrals}
                        selectedReferral={selectedReferral}
                        onSelect={handleReferralSelect}
                        isExpanded={expandedSections.has("referral-section")}
                        onToggle={() => toggleSection("referral-section")}
                    />

                    <TeacherSection
                        teachers={teachers}
                        selectedTeacher={selectedTeacher}
                        selectedCommission={selectedCommission}
                        onSelectTeacher={handleTeacherSelect}
                        onSelectCommission={handleCommissionSelect}
                        onAddCommission={handleAddCommission}
                        isExpanded={expandedSections.has("teacher-section")}
                        onToggle={() => toggleSection("teacher-section")}
                    />

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>
            }
        />
    );
}
