"use client";

import { useState, useEffect, useCallback, useRef, memo, useMemo, forwardRef, useImperativeHandle } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DateRangeBadge } from "@/src/components/ui/badge";
import { useRegisterActions, useBookingForm, useRegisterData, useRegisterQueues, useShouldOpenSections } from "./RegisterContext";
import { DateSection } from "./booking-sections/DateSection";
import { EquipmentSection } from "./booking-sections/EquipmentSection";
import { PackageSection } from "./booking-sections/PackageSection";
import { StudentsSection } from "./booking-sections/StudentsSection";
import { ReferralSection } from "./booking-sections/ReferralSection";
import { TeacherSection } from "./booking-sections/TeacherSection";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

type SectionId =
    | "dates-section"
    | "equipment-section"
    | "package-section"
    | "students-section"
    | "referral-section"
    | "teacher-section"
    | "commission-section";

interface BookingFormProps {
    teachers: any[];
}

const BookingForm = forwardRef<{ resetSections: () => void }, BookingFormProps>(function BookingForm(
    { teachers }: BookingFormProps,
    ref,
) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentIdParam = searchParams.get("studentId");
    const addParam = searchParams.get("add");
    const { removeFromQueue, refreshData, isRefreshing } = useRegisterActions();
    const { tables: contextData } = useRegisterData();
    const bookingForm = useBookingForm();
    const queues = useRegisterQueues();
    const { shouldOpenAllSections, setShouldOpenAllSections } = useShouldOpenSections();

    // Use context data (updated by refreshData) or fall back to props for initial load
    const { currentStudents, currentTeachers, currentPackages } = useMemo(
        () => ({
            currentStudents: contextData.students,
            currentTeachers: teachers,
            currentPackages: contextData.packages,
        }),
        [contextData.students, teachers, contextData.packages],
    );

    // Memoize stats map for performance
    const studentStatsMap = useMemo(() => contextData.studentBookingStats || {}, [contextData.studentBookingStats]);

    // Calculate package counts by equipment category
    const packageCategoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        // Initialize all categories with 0
        EQUIPMENT_CATEGORIES.forEach((cat) => {
            counts[cat.id] = 0;
        });
        // Count packages by category
        currentPackages.forEach((pkg) => {
            const category = pkg.categoryEquipment;
            if (category && counts[category] !== undefined) {
                counts[category] = (counts[category] || 0) + 1;
            }
        });
        return counts;
    }, [currentPackages]);

    // Use context state
    const selectedEquipmentCategory = bookingForm.form.selectedEquipmentCategory;
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
        () =>
            new Set(
                studentIdParam
                    ? ["equipment-section", "package-section", "teacher-section", "commission-section"]
                    : [
                          "dates-section",
                          "equipment-section",
                          "package-section",
                          "students-section",
                          "referral-section",
                          "teacher-section",
                          "commission-section",
                      ],
            ),
    );

    // Expose resetSections via ref
    useImperativeHandle(
        ref,
        () => ({
            resetSections: () => {
                setExpandedSections(
                    new Set([
                        "dates-section",
                        "equipment-section",
                        "package-section",
                        "students-section",
                        "referral-section",
                        "teacher-section",
                        "commission-section",
                    ]),
                );
            },
        }),
        [],
    );

    // Open all sections when booking is submitted
    useEffect(() => {
        if (shouldOpenAllSections) {
            setExpandedSections(
                new Set([
                    "dates-section",
                    "equipment-section",
                    "package-section",
                    "students-section",
                    "referral-section",
                    "teacher-section",
                    "commission-section",
                ]),
            );
            setShouldOpenAllSections(false);
        }
    }, [shouldOpenAllSections, setShouldOpenAllSections]);

    // Ensure sections are expanded if their value is empty/null
    useEffect(() => {
        if (addParam) return;

        setExpandedSections((prev) => {
            const next = new Set(prev);
            let changed = false;

            if (!selectedEquipmentCategory && !next.has("equipment-section")) {
                next.add("equipment-section");
                changed = true;
            }

            if (!selectedPackage && !next.has("package-section")) {
                next.add("package-section");
                changed = true;
            }

            if (!studentIdParam && selectedStudentIds.length === 0 && !next.has("students-section")) {
                next.add("students-section");
                changed = true;
            }

            if (!selectedTeacher && !next.has("teacher-section")) {
                next.add("teacher-section");
                changed = true;
            }

            return changed ? next : prev;
        });
    }, [selectedEquipmentCategory, selectedPackage, selectedStudentIds.length, selectedTeacher, studentIdParam]);

    // Track if we've processed the add param to avoid infinite loops
    const processedParamRef = useRef<string | null>(null);
    // Track if we've initiated refresh for the add param
    const refreshInitiatedRef = useRef<string | null>(null);

    // If studentId param exists, set package capacity to 1
    useEffect(() => {
        if (studentIdParam && selectedPackage && selectedPackage.capacityStudents !== 1) {
            // Find single-student packages
            const singlePackage = currentPackages.find((pkg) => pkg.capacityStudents === 1);
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
        if (addParam && refreshInitiatedRef.current !== addParam) {
            refreshInitiatedRef.current = addParam;
            refreshData();
        }
    }, [addParam, refreshData]);

    // Handle legacy ?add=entity:id param if needed (fallback)
    useEffect(() => {
        if (!addParam || processedParamRef.current === addParam) return;
        if (isRefreshing) return; 

        processedParamRef.current = addParam;

        const parts = addParam.split(":");
        const entityType = parts[0];
        const entityId = parts[1];

        // Silence navigation-based selections, just process them
        if (entityType === "student") {
            if (!selectedStudentIds.includes(entityId)) {
                if (selectedPackage && selectedStudentIds.length >= selectedPackage.capacityStudents) {
                    toast.error(`Maximum ${selectedPackage.capacityStudents} students for this package`);
                } else {
                    bookingForm.setForm({ selectedStudentIds: [...selectedStudentIds, entityId] });
                }
            }
        } else if (entityType === "teacher") {
            const teacher = currentTeachers.find((t) => t.schema.id === entityId);
            if (teacher) bookingForm.setForm({ selectedTeacher: teacher });
        } else if (entityType === "package") {
            const pkg = currentPackages.find((p) => p.id === entityId);
            if (pkg) bookingForm.setForm({ selectedPackage: pkg, selectedEquipmentCategory: pkg.categoryEquipment });
        }
        
        router.replace("/register", { scroll: false });
    }, [addParam, isRefreshing, selectedStudentIds, currentTeachers, currentPackages, router, bookingForm, selectedPackage]);

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

    const openSection = useCallback((sectionId: SectionId) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            newSet.add(sectionId);
            return newSet;
        });
    }, []);

    // Reactive UI Logic: Auto-collapse/expand sections based on selection state
    useEffect(() => {
        // 1. If package is selected, close equipment and package sections
        if (selectedPackage) {
            closeSection("equipment-section");
            closeSection("package-section");
        }

        // 2. Student section management
        if (selectedPackage) {
            if (selectedStudentIds.length >= selectedPackage.capacityStudents) {
                closeSection("students-section");
            } else {
                openSection("students-section");
            }
        }

        // 3. If teacher AND commission are selected, close teacher section
        if (selectedTeacher && selectedCommission) {
            closeSection("teacher-section");
        }
    }, [selectedPackage, selectedStudentIds.length, selectedTeacher, selectedCommission, closeSection, openSection]);

    const handleEquipmentSelect = (category: string) => {
        bookingForm.setForm({ selectedEquipmentCategory: category });
        // Clear package if category changed
        if (selectedPackage && selectedPackage.categoryEquipment !== category) {
            bookingForm.setForm({ selectedPackage: null });
        }
    };

    const handlePackageSelect = (pkg: any) => {
        if (pkg) {
            bookingForm.setForm({
                selectedPackage: pkg,
                selectedEquipmentCategory: pkg.categoryEquipment,
            });
            closeSection("package-section");
            closeSection("equipment-section");
        } else {
            bookingForm.setForm({ selectedPackage: null });
        }
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
        if (teacher?.schema?.commissions && teacher.schema.commissions.length === 1) {
            bookingForm.setForm({ selectedCommission: teacher.schema.commissions[0] });
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
        alert("Feature coming soon!");
    };

    return (
        <div className="space-y-6 mb-42">
            <DateSection
                dateRange={dateRange}
                onDateChange={(newDateRange) => bookingForm.setForm({ dateRange: newDateRange })}
                isExpanded={expandedSections.has("dates-section")}
                onToggle={() => toggleSection("dates-section")}
                onExpand={() => openSection("dates-section")}
                title={dateRangeTitle}
            />

            <EquipmentSection
                selectedEquipmentCategory={selectedEquipmentCategory}
                onSelect={handleEquipmentSelect}
                isExpanded={expandedSections.has("equipment-section")}
                onToggle={() => toggleSection("equipment-section")}
                onExpand={() => openSection("equipment-section")}
                packageCategoryCounts={packageCategoryCounts}
            />

            <PackageSection
                packages={currentPackages}
                selectedPackage={selectedPackage}
                onSelect={handlePackageSelect}
                isExpanded={expandedSections.has("package-section")}
                onToggle={() => toggleSection("package-section")}
                onExpand={() => openSection("package-section")}
                selectedStudentCount={selectedStudentIds.length}
                selectedEquipmentCategory={selectedEquipmentCategory}
                previousSectionSelected={selectedEquipmentCategory !== null}
                isLast={false}
            />

            <StudentsSection
                students={currentStudents}
                selectedStudentIds={selectedStudentIds}
                onToggle={handleStudentToggle}
                isExpanded={expandedSections.has("students-section")}
                onSectionToggle={() => toggleSection("students-section")}
                onExpand={() => openSection("students-section")}
                selectedPackage={selectedPackage}
                studentStatsMap={studentStatsMap}
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
                onExpand={() => openSection("teacher-section")}
                onClose={() => closeSection("teacher-section")}
                isLast={!(contextData.referrals && contextData.referrals.length > 0)}
            />

            {contextData.referrals && contextData.referrals.length > 0 && (
                <ReferralSection
                    referrals={contextData.referrals}
                    selectedReferral={selectedReferral}
                    onSelect={handleReferralSelect}
                    isExpanded={expandedSections.has("referral-section")}
                    onToggle={() => toggleSection("referral-section")}
                    onExpand={() => openSection("referral-section")}
                    onClose={() => closeSection("referral-section")}
                    isLast={true}
                />
            )}

            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">{error}</div>
            )}
        </div>
    );
});

export default memo(BookingForm);