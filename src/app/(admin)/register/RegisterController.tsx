"use client";

import type { StudentFormData } from "@/src/components/forms/Student4SchoolForm";
import type { TeacherFormData } from "@/src/components/forms/Teacher4SchoolForm";
import type { PackageFormData } from "@/src/components/forms/Package4SchoolForm";
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
                            <div className="space-y-2 pt-2">
                                <label className="text-xs font-medium text-muted-foreground">Leader</label>
                                <select
                                    value={leaderStudentId}
                                    onChange={(e) => onLeaderStudentChange?.(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="" disabled>
                                        Select leader student
                                    </option>
                                    {selectedStudents.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.firstName} {student.lastName}
                                        </option>
                                    ))}
                                </select>
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
