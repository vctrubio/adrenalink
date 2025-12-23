"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DateRangeBadge } from "@/src/components/ui/badge";
import { useTeacherLessonStats, useStudentBookingStats, useRegisterActions, useBookingForm } from "./RegisterContext";
import { DateSection } from "./booking-sections/DateSection";
import { PackageSection } from "./booking-sections/PackageSection";
import { StudentsSection } from "./booking-sections/StudentsSection";
import { ReferralSection } from "./booking-sections/ReferralSection";
import { TeacherSection } from "./booking-sections/TeacherSection";

type SectionId = "dates-section" | "package-section" | "students-section" | "referral-section" | "teacher-section" | "commission-section";

interface StudentStats {
    bookingCount: number;
    durationHours: number;
    allBookingsCompleted?: boolean;
}

interface BookingFormProps {
    school: any;
    schoolPackages: any[];
    students: any[];
    teachers: any[];
    referrals: any[];
    studentStats?: Record<string, StudentStats>;
}

export default function BookingForm({ school, schoolPackages, students, teachers, referrals, studentStats }: BookingFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentIdParam = searchParams.get("studentId");
    const addParam = searchParams.get("add");
    const studentBookingStats = useStudentBookingStats();
    const teacherLessonStats = useTeacherLessonStats();
    const { removeFromQueue } = useRegisterActions();
    const bookingForm = useBookingForm();

    // Use context state
    const selectedPackage = bookingForm.form.selectedPackage;
    const selectedStudentIds = bookingForm.form.selectedStudentIds;
    const leaderStudentId = bookingForm.form.leaderStudentId;
    const selectedTeacher = bookingForm.form.selectedTeacher;
    const selectedCommission = bookingForm.form.selectedCommission;
    const selectedReferral = bookingForm.form.selectedReferral;
    const dateRange = bookingForm.form.dateRange;

    // Local state for UI only
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
                bookingForm.setForm({ selectedPackage: singlePackage });
            }
        }
    }, [studentIdParam, schoolPackages, selectedPackage]);

    // Set leader student to first selected student
    useEffect(() => {
        if (selectedStudentIds.length > 0) {
            bookingForm.setForm({ leaderStudentId: selectedStudentIds[0] });
        } else {
            bookingForm.setForm({ leaderStudentId: "" });
        }
    }, [selectedStudentIds]);

    // Handle ?add=entity:id param to auto-select entities from queue
    useEffect(() => {
        if (!addParam) return;

        const parts = addParam.split(":");
        const entityType = parts[0];
        const entityId = parts[1];
        // Optional 3rd part for commissionId
        const extraId = parts[2];

        if (entityType === "student") {
            // Expand students section
            setExpandedSections(prev => new Set([...prev, "students-section"]));
            // Select student if not already selected
            if (!selectedStudentIds.includes(entityId)) {
                bookingForm.setForm({ selectedStudentIds: [...selectedStudentIds, entityId] });
            }
            // Remove from queue
            removeFromQueue("students", entityId);
            // Clear param from URL
            router.replace("/register", { scroll: false });
        } else if (entityType === "teacher") {
            // Expand teacher section
            setExpandedSections(prev => new Set([...prev, "teacher-section"]));
            // Find and select teacher
            const teacher = teachers.find(t => t.id === entityId);
            if (teacher) {
                bookingForm.setForm({ selectedTeacher: teacher });
                
                // If commission ID provided, find and select it
                if (extraId) {
                    const commission = teacher.commissions?.find((c: any) => c.id === extraId);
                    if (commission) {
                        bookingForm.setForm({ selectedCommission: commission });
                    }
                }
            }
            // Remove from queue
            removeFromQueue("teachers", entityId);
            // Clear param from URL
            router.replace("/register", { scroll: false });
        } else if (entityType === "package") {
            // Expand package section
            setExpandedSections(prev => new Set([...prev, "package-section"]));
            // Find and select package
            const pkg = schoolPackages.find(p => p.id === entityId);
            if (pkg) {
                bookingForm.setForm({ selectedPackage: pkg });
            }
            // Remove from queue
            removeFromQueue("packages", entityId);
            // Clear param from URL
            router.replace("/register", { scroll: false });
        }
    }, [addParam, selectedStudentIds, teachers, schoolPackages, removeFromQueue, router]);

    const selectedStudentsList = students
        .map(ss => ss.student)
        .filter((student: any) => selectedStudentIds.includes(student.id));

    const selectedStudents = selectedStudentsList;

    const dateRangeTitle = <DateRangeBadge startDate={dateRange.startDate} endDate={dateRange.endDate} />;

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
        bookingForm.setForm({ selectedPackage: pkg });
        closeSection("package-section");
    };

    const handleStudentToggle = (studentId: string) => {
        if (selectedStudentIds.includes(studentId)) {
            bookingForm.setForm({ selectedStudentIds: selectedStudentIds.filter((id) => id !== studentId) });
        } else {
            // If package is selected, enforce capacity limit
            if (selectedPackage && selectedStudentIds.length >= selectedPackage.capacityStudents) {
                setError(`Maximum ${selectedPackage.capacityStudents} students for this package`);
                setTimeout(() => setError(null), 3000);
                return;
            }
            const newIds = [...selectedStudentIds, studentId];
            bookingForm.setForm({ selectedStudentIds: newIds });
            // Auto-close section if capacity is met
            if (selectedPackage && newIds.length === selectedPackage.capacityStudents) {
                closeSection("students-section");
            }
        }
    };

    const handleTeacherSelect = (teacher: any) => {
        bookingForm.setForm({ selectedTeacher: teacher });
        // Auto-select first commission if only one exists
        if (teacher?.commissions && teacher.commissions.length === 1) {
            bookingForm.setForm({ selectedCommission: teacher.commissions[0] });
        } else {
            bookingForm.setForm({ selectedCommission: null });
        }
    };

    const handleCommissionSelect = (commission: any) => {
        bookingForm.setForm({ selectedCommission: commission });
    };

    const handleReferralSelect = (referral: any | null) => {
        bookingForm.setForm({ selectedReferral: referral });
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

        // Update the teacher's commissions in context
        const updatedTeacher = {
            ...selectedTeacher,
            commissions: [...(selectedTeacher?.commissions || []), newCommission],
        };

        bookingForm.setForm({ selectedTeacher: updatedTeacher, selectedCommission: newCommission });

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

    return (
        <div className="space-y-6">
            <DateSection
                dateRange={dateRange}
                onDateChange={(newDateRange) => bookingForm.setForm({ dateRange: newDateRange })}
                isExpanded={expandedSections.has("dates-section")}
                onToggle={() => toggleSection("dates-section")}
                title={dateRangeTitle}
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
                studentStatsMap={studentBookingStats}
                selectedPackage={selectedPackage}
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
                teacherStatsMap={teacherLessonStats}
                onClose={() => closeSection("teacher-section")}
            />

            <ReferralSection
                referrals={referrals}
                selectedReferral={selectedReferral}
                onSelect={handleReferralSelect}
                isExpanded={expandedSections.has("referral-section")}
                onToggle={() => toggleSection("referral-section")}
                onClose={() => closeSection("referral-section")}
            />

            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                    {error}
                </div>
            )}
        </div>
    );
}
