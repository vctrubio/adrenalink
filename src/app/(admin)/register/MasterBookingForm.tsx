"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DateRangeBadge } from "@/src/components/ui/badge";
import { useTeacherLessonStats, useStudentBookingStats, useRegisterActions, useBookingForm, useRegisterData } from "./RegisterContext";
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
    const { removeFromQueue, refreshData } = useRegisterActions();
    const contextData = useRegisterData();
    const bookingForm = useBookingForm();

    // Use context data (updated by refreshData) or fall back to props for initial load
    const currentStudents = contextData.students || students;
    const currentTeachers = contextData.teachers || teachers;
    const currentPackages = contextData.packages || schoolPackages;

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

    // Track if we've processed the add param to avoid infinite loops
    const processedParamRef = useRef<string | null>(null);

    // If studentId param exists, set package capacity to 1
    useEffect(() => {
        if (studentIdParam && selectedPackage && selectedPackage.capacityStudents !== 1) {
            // Find single-student packages
            const singlePackage = currentPackages.find(pkg => pkg.capacityStudents === 1);
            if (singlePackage) {
                bookingForm.setForm({ selectedPackage: singlePackage });
            }
        }
    }, [studentIdParam, currentPackages, selectedPackage, bookingForm]);

    // Set leader student to first selected student
    useEffect(() => {
        if (selectedStudentIds.length > 0) {
            bookingForm.setForm({ leaderStudentId: selectedStudentIds[0] });
        } else {
            bookingForm.setForm({ leaderStudentId: "" });
        }
    }, [selectedStudentIds]);

    // Refresh data when add param is detected for the first time
    useEffect(() => {
        if (addParam && processedParamRef.current !== addParam) {
            refreshData();
        }
    }, [addParam, refreshData]);

    // Handle ?add=entity:id param to auto-select entities from queue
    useEffect(() => {
        if (!addParam || processedParamRef.current === addParam) return;

        processedParamRef.current = addParam;

        const parts = addParam.split(":");
        const entityType = parts[0];
        const entityId = parts[1];
        const extraId = parts[2];

        if (entityType === "student") {
            setExpandedSections(prev => new Set([...prev, "students-section"]));
            if (!selectedStudentIds.includes(entityId)) {
                bookingForm.setForm({ selectedStudentIds: [...selectedStudentIds, entityId] });
            }
            removeFromQueue("students", entityId);
            router.replace("/register", { scroll: false });
        } else if (entityType === "teacher") {
            setExpandedSections(prev => new Set([...prev, "teacher-section"]));
            const teacher = currentTeachers.find(t => t.id === entityId);
            if (teacher) {
                bookingForm.setForm({ selectedTeacher: teacher });
                if (extraId) {
                    const commission = teacher.commissions?.find((c: any) => c.id === extraId);
                    if (commission) {
                        bookingForm.setForm({ selectedCommission: commission });
                    }
                }
            }
            removeFromQueue("teachers", entityId);
            router.replace("/register", { scroll: false });
        } else if (entityType === "package") {
            setExpandedSections(prev => new Set([...prev, "package-section"]));
            const pkg = currentPackages.find(p => p.id === entityId);
            if (pkg) {
                bookingForm.setForm({ selectedPackage: pkg });
            }
            removeFromQueue("packages", entityId);
            router.replace("/register", { scroll: false });
        }
    }, [addParam, selectedStudentIds, currentTeachers, currentPackages, removeFromQueue, router, bookingForm]);

    const selectedStudentsList = currentStudents
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
                packages={currentPackages}
                selectedPackage={selectedPackage}
                onSelect={handlePackageSelect}
                isExpanded={expandedSections.has("package-section")}
                onToggle={() => toggleSection("package-section")}
                selectedStudentCount={selectedStudentIds.length}
            />

            <StudentsSection
                students={currentStudents}
                selectedStudentIds={selectedStudentIds}
                onToggle={handleStudentToggle}
                preSelectedId={studentIdParam}
                isExpanded={expandedSections.has("students-section")}
                onSectionToggle={() => toggleSection("students-section")}
                studentStatsMap={studentBookingStats}
                selectedPackage={selectedPackage}
            />

            <TeacherSection
                teachers={currentTeachers}
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