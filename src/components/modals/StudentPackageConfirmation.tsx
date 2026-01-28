"use client";

import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StudentPackageRequest } from "@/supabase/server/student-package";
import {
    acceptStudentPackageAndCreateBooking,
    getAllStudentsForSchool,
    updateStudentPackageStatus,
    getStudentByClerkId,
} from "@/supabase/server/student-package";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import type { TeacherProvider } from "@/supabase/server/teachers";
import { PackageSummary } from "@/src/app/(admin)/register/controller-sections/PackageSummary";
import { StudentSummary } from "@/src/app/(admin)/register/controller-sections/StudentSummary";
import { StudentCreateForm } from "@/src/validation/student";
import { SchoolPackageCreateForm } from "@/src/validation/school-package";
import { MemoTeacherTable } from "@/src/components/tables/TeacherTable";
import { MemoStudentTable } from "@/src/components/tables/StudentTable";
import { formatDate } from "@/getters/date-getter";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import toast from "react-hot-toast";
import BookingIcon from "@/public/appSvgs/BookingIcon";

interface StudentPackageConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    invitation: StudentPackageRequest;
    allInvitations?: StudentPackageRequest[];
    onSuccess?: () => void;
}

function ModalHeader({ startDate, endDate }: { startDate: string; endDate: string }) {
    return (
        <div className="text-center py-8 px-6 space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Confirm Booking</h2>
            <div className="flex items-center justify-center gap-3 pt-4">
                <BookingIcon size={20} className="text-muted-foreground" />
                <DateRangeBadge startDate={startDate} endDate={endDate} />
            </div>
        </div>
    );
}

function PackageSection({ packageFormData }: { packageFormData: SchoolPackageCreateForm }) {
    return (
        <PackageSummary
            packageFormData={packageFormData as any}
            hideProgressBar={true}
            hideType={true}
            hideVisibility={true}
            title="Package"
        />
    );
}

interface StudentsSectionProps {
    totalSelectedStudents: number;
    capacity: number;
    requestingStudentFormData: StudentCreateForm | null;
    selectedStudentIds: string[];
    selectedStudentsData: Record<string, { student: any; studentFormData: StudentCreateForm }>;
    otherPackageRequests: StudentPackageRequest[];
    onRemoveStudent: (studentId: string, requestId?: string) => void;
}

function StudentsSection({
    totalSelectedStudents,
    capacity,
    requestingStudentFormData,
    selectedStudentIds,
    selectedStudentsData,
    otherPackageRequests,
    onRemoveStudent,
}: StudentsSectionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Students ({totalSelectedStudents}/{capacity})
                </span>
            </div>
            
            <div className="space-y-3">
                {requestingStudentFormData && (
                    <div className="relative">
                        <StudentSummary studentFormData={requestingStudentFormData as any} />
                    </div>
                )}
                
                {selectedStudentIds
                    .filter((studentId) => selectedStudentsData[studentId]?.studentFormData)
                    .map((studentId) => {
                        const studentInfo = selectedStudentsData[studentId];
                        if (!studentInfo?.studentFormData) return null;
                        
                        const packageRequest = otherPackageRequests.find(
                            (req) => req.student_data?.student?.id === studentId
                        );
                        const requestId = packageRequest?.id;
                        const uniqueKey = requestId ? `${studentId}-request-${requestId}` : `${studentId}-table`;
                        
                        return (
                            <div key={uniqueKey} className="relative mb-3">
                                <StudentSummary studentFormData={studentInfo.studentFormData as any} />
                                <button
                                    type="button"
                                    onClick={() => onRemoveStudent(studentId, requestId)}
                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

interface SelectOtherRequestSectionProps {
    otherPackageRequests: StudentPackageRequest[];
    selectedPackageRequestIds: string[];
    onToggle: (requestId: string) => void;
}

function SelectOtherRequestSection({
    otherPackageRequests,
    selectedPackageRequestIds,
    onToggle,
}: SelectOtherRequestSectionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Select Other Request
                </span>
            </div>
            <div className="space-y-2">
                {otherPackageRequests.map((request) => {
                    const isSelected = selectedPackageRequestIds.includes(request.id);
                    const studentName = request.student_name?.fullName || request.requested_clerk_id;
                    return (
                        <div
                            key={request.id}
                            onClick={() => onToggle(request.id)}
                            className={`
                                p-3 rounded-lg border cursor-pointer transition-all
                                ${
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border/50 hover:border-border"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggle(request.id)}
                                    className="w-4 h-4 rounded border-border"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold">{studentName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(request.requested_date_start)} - {formatDate(request.requested_date_end)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface SelectAdditionalStudentsSectionProps {
    selectedStudentIds: string[];
    remainingCapacity: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    isLoading: boolean;
    allStudents: any[];
    filteredStudentsForTable: any[];
    allStudentsStatsMap: Record<string, any>;
    capacity: number;
    requestingStudentId: string | null;
    selectedStudentsData: Record<string, { student: any; studentFormData: StudentCreateForm }>;
    otherPackageRequests: StudentPackageRequest[];
    onToggleStudent: (studentId: string) => void;
    onRemoveStudent: (studentId: string, requestId?: string) => void;
    onFetchAllStudents: () => void;
}

function SelectAdditionalStudentsSection({
    selectedStudentIds,
    remainingCapacity,
    isExpanded,
    onToggleExpand,
    isLoading,
    allStudents,
    filteredStudentsForTable,
    allStudentsStatsMap,
    capacity,
    requestingStudentId,
    selectedStudentsData,
    otherPackageRequests,
    onToggleStudent,
    onRemoveStudent,
    onFetchAllStudents,
}: SelectAdditionalStudentsSectionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Select Additional Students ({selectedStudentIds.length}/{remainingCapacity})
                </span>
                {selectedStudentIds.length >= remainingCapacity ? (
                    <button
                        type="button"
                        onClick={() => onToggleExpand()}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                        <ChevronUp size={16} className="text-muted-foreground" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                            <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                    </button>
                )}
            </div>

            {!isExpanded && selectedStudentIds.length > 0 && (
                <div className="space-y-3">
                    {selectedStudentIds
                        .filter((studentId) => selectedStudentsData[studentId]?.studentFormData)
                        .map((studentId) => {
                            const studentInfo = selectedStudentsData[studentId];
                            if (!studentInfo?.studentFormData) return null;
                            
                            const packageRequest = otherPackageRequests.find(
                                (req) => req.student_data?.student?.id === studentId
                            );
                            const requestId = packageRequest?.id;
                            const uniqueKey = requestId ? `${studentId}-request-${requestId}` : `${studentId}-table`;
                            
                            return (
                                <div key={uniqueKey} className="relative mb-3">
                                    <StudentSummary studentFormData={studentInfo.studentFormData as any} />
                                    <button
                                        type="button"
                                        onClick={() => onRemoveStudent(studentId, requestId)}
                                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })}
                </div>
            )}

            {isExpanded && (
                <div>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : allStudents.length > 0 ? (
                        <MemoStudentTable
                            students={filteredStudentsForTable}
                            selectedStudentIds={selectedStudentIds}
                            onToggle={onToggleStudent}
                            capacity={capacity}
                            studentStatsMap={allStudentsStatsMap}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={onFetchAllStudents}
                            className="w-full py-3 px-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-sm font-medium"
                        >
                            Load All Students
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function LeaderNameInput({
    leaderStudentName,
    onNameChange,
}: {
    leaderStudentName: string;
    onNameChange: (name: string) => void;
}) {
    return (
        <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 block">
                Leader Student Name
            </label>
            <input
                type="text"
                value={leaderStudentName}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Enter leader student name"
            />
        </div>
    );
}

interface TeacherSectionProps {
    teachers: TeacherProvider[];
    selectedTeacher: TeacherProvider | null;
    selectedCommission: any | null;
    onSelectTeacher: (teacher: TeacherProvider) => void;
    onSelectCommission: (commission: any) => void;
}

function TeacherSection({
    teachers,
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
}: TeacherSectionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Assign Teacher (Optional)
                </span>
            </div>

            {teachers.length > 0 ? (
                <MemoTeacherTable
                    teachers={teachers}
                    selectedTeacher={selectedTeacher}
                    selectedCommission={selectedCommission}
                    onSelectTeacher={onSelectTeacher}
                    onSelectCommission={onSelectCommission}
                />
            ) : (
                <p className="text-sm text-muted-foreground">No teachers available</p>
            )}
        </div>
    );
}

interface SubmitButtonProps {
    isSubmitting: boolean;
    isDisabled: boolean;
    hasTeacher: boolean;
    buttonText: string;
    onSubmit: () => void;
}

function SubmitButton({ isSubmitting, isDisabled, hasTeacher, buttonText, onSubmit }: SubmitButtonProps) {
    return (
        <div className="border-t border-border/50 bg-card px-6 py-4">
            <button
                onClick={onSubmit}
                disabled={isDisabled}
                className={`
                    w-full py-4 rounded-2xl font-black uppercase tracking-wider text-lg transition-all flex items-center justify-center gap-3
                    ${
                        isDisabled
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : hasTeacher
                              ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl active:scale-[0.98]"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl active:scale-[0.98]"
                    }
                `}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        {hasTeacher ? "Creating Lesson..." : "Creating Booking..."}
                    </>
                ) : (
                    buttonText
                )}
            </button>
        </div>
    );
}

export function StudentPackageConfirmation({
    isOpen,
    onClose,
    invitation,
    allInvitations = [],
    onSuccess,
}: StudentPackageConfirmationProps) {
    const { teachers } = useSchoolTeachers();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [requestingStudentId, setRequestingStudentId] = useState<string | null>(null);
    const [requestingStudentData, setRequestingStudentData] = useState<any>(null);
    const [requestingStudentFormData, setRequestingStudentFormData] = useState<StudentCreateForm | null>(null);
    const [leaderStudentName, setLeaderStudentName] = useState("");

    const [otherPackageRequests, setOtherPackageRequests] = useState<StudentPackageRequest[]>([]);
    const [selectedPackageRequestIds, setSelectedPackageRequestIds] = useState<string[]>([]);

    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [allStudentsStatsMap, setAllStudentsStatsMap] = useState<Record<string, any>>({});
    const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false);
    const [isStudentSelectionExpanded, setIsStudentSelectionExpanded] = useState(true);

    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [selectedStudentsData, setSelectedStudentsData] = useState<Record<string, { student: any; studentFormData: StudentCreateForm }>>({});

    const [selectedTeacher, setSelectedTeacher] = useState<TeacherProvider | null>(null);
    const [selectedCommission, setSelectedCommission] = useState<any | null>(null);

    const { school_package, requested_date_start, requested_date_end, requested_clerk_id } = invitation;
    const capacity = school_package.capacity_students || 1;
    const isSingleStudent = capacity === 1;
    const totalSelectedStudents = selectedStudentIds.length + 1;
    const remainingCapacity = capacity - totalSelectedStudents;

    const validPackageType: "rental" | "lessons" = 
        school_package.package_type === "rental" || school_package.package_type === "lessons" 
            ? (school_package.package_type as "rental" | "lessons")
            : "lessons";
    
    const packageFormData: SchoolPackageCreateForm = {
        category_equipment: (school_package.category_equipment as "kite" | "wing" | "windsurf") || "kite",
        capacity_equipment: school_package.capacity_equipment || 1,
        capacity_students: capacity,
        duration_minutes: school_package.duration_minutes || 0,
        price_per_student: school_package.price_per_student || 0,
        package_type: validPackageType,
        description: school_package.description || "",
        is_public: school_package.is_public ?? false,
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setIsLoading(true);
            
            try {
                let studentData = invitation.student_data;
                
                if (!studentData && invitation.requested_clerk_id) {
                    const fetchResult = await getStudentByClerkId(invitation.requested_clerk_id);
                    if (fetchResult.success && fetchResult.data) {
                        studentData = fetchResult.data;
                    } else {
                        toast.error("Student data not found. Please refresh the page.");
                        setIsLoading(false);
                        return;
                    }
                }
                
                if (studentData && studentData.student) {
                    const student = studentData.student;
                    const studentId = student.id;
                    
                    setRequestingStudentId(studentId);
                    setRequestingStudentData(studentData);
                    
                    const studentFormData: StudentCreateForm = {
                        first_name: student.first_name,
                        last_name: student.last_name,
                        passport: student.passport || "",
                        country: student.country || "",
                        phone: student.phone || "",
                        languages: student.languages || [],
                        rental: studentData.rental || false,
                        description: studentData.description || "",
                        email: student.email || "",
                    };
                    
                    setRequestingStudentFormData(studentFormData);
                    setLeaderStudentName(invitation.student_name?.fullName || `${student.first_name} ${student.last_name}`);

                    if (!isSingleStudent) {
                        const otherRequests = allInvitations.filter(
                            (req) => req.school_package.id === school_package.id && 
                                     req.id !== invitation.id && 
                                     req.status === "requested"
                        );
                        setOtherPackageRequests(otherRequests);
                    }
                } else {
                    toast.error("Student data not found. Please refresh the page.");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen, invitation.id, school_package.id, isSingleStudent, allInvitations, requested_clerk_id]);

    useEffect(() => {
        if (isStudentSelectionExpanded && allStudents.length === 0 && !isLoadingAllStudents && remainingCapacity > 0 && !isSingleStudent) {
            handleFetchAllStudents();
        }
    }, [isStudentSelectionExpanded, allStudents.length, isLoadingAllStudents, remainingCapacity, isSingleStudent]);

    useEffect(() => {
        if (!isOpen) {
            setIsSuccess(false);
            setSelectedTeacher(null);
            setSelectedCommission(null);
            setSelectedStudentIds([]);
            setRequestingStudentId(null);
            setRequestingStudentData(null);
            setRequestingStudentFormData(null);
            setOtherPackageRequests([]);
            setSelectedPackageRequestIds([]);
            setAllStudents([]);
            setAllStudentsStatsMap({});
            setLeaderStudentName("");
            setSelectedStudentsData({});
            setIsStudentSelectionExpanded(true);
        }
    }, [isOpen]);

    const handleTogglePackageRequest = async (requestId: string) => {
        const request = otherPackageRequests.find((r) => r.id === requestId);
        if (!request?.student_data?.student) {
            toast.error("Student data not available");
            return;
        }

        const isSelected = selectedPackageRequestIds.includes(requestId);
        const studentId = request.student_data.student.id;

        if (isSelected) {
            setSelectedPackageRequestIds((prev) => prev.filter((id) => id !== requestId));
            setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
            setSelectedStudentsData((prev) => {
                const newData = { ...prev };
                delete newData[studentId];
                return newData;
            });
        } else {
            if (selectedStudentIds.includes(studentId)) {
                return;
            }
            
            if (selectedStudentIds.length >= capacity - 1) {
                toast.error(`Maximum ${capacity - 1} additional student${capacity > 2 ? "s" : ""} allowed`);
                return;
            }

            const studentData = request.student_data;
            const student = studentData.student;
            
            const studentFormData: StudentCreateForm = {
                first_name: student.first_name,
                last_name: student.last_name,
                passport: student.passport || "",
                country: student.country || "",
                phone: student.phone || "",
                languages: student.languages || [],
                rental: studentData.rental || false,
                description: studentData.description || "",
                email: student.email || "",
            };

            setSelectedStudentsData((prev) => ({
                ...prev,
                [studentId]: { student, studentFormData },
            }));

            setSelectedStudentIds((prev) => [...prev, studentId]);
            setSelectedPackageRequestIds((prev) => [...prev, requestId]);
        }
    };

    const handleToggleStudent = async (studentId: string) => {
        if (studentId === requestingStudentId) return;

        const isSelected = selectedStudentIds.includes(studentId);

        if (isSelected) {
            const packageRequest = otherPackageRequests.find(
                (req) => req.student_data?.student?.id === studentId
            );
            if (packageRequest) {
                setSelectedPackageRequestIds((prev) => prev.filter((id) => id !== packageRequest.id));
            }
            
            setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
            setSelectedStudentsData((prev) => {
                const newData = { ...prev };
                delete newData[studentId];
                return newData;
            });
        } else {
            if (selectedStudentIds.includes(studentId)) {
                return;
            }
            
            if (selectedStudentIds.length >= capacity - 1) {
                toast.error(`Maximum ${capacity - 1} additional student${capacity > 2 ? "s" : ""} allowed`);
                return;
            }

            const student = allStudents.find((s: any) => s.student.id === studentId);
            if (!student) return;

            const studentFormData: StudentCreateForm = {
                first_name: student.student.first_name,
                last_name: student.student.last_name,
                passport: student.student.passport,
                country: student.student.country,
                phone: student.student.phone || "",
                languages: student.student.languages || [],
                rental: student.rental || false,
                description: student.description || "",
                email: student.student.email || "",
            };

            setSelectedStudentsData((prev) => ({
                ...prev,
                [studentId]: {
                    student: {
                        id: student.student.id,
                        first_name: student.student.first_name,
                        last_name: student.student.last_name,
                        passport: student.student.passport,
                        country: student.student.country,
                        phone: student.student.phone || "",
                        languages: student.student.languages || [],
                    },
                    studentFormData,
                },
            }));

            setSelectedStudentIds((prev) => [...prev, studentId]);
            
            if (allStudents.length === 0 && !isLoadingAllStudents) {
                handleFetchAllStudents();
            }
        }
    };

    const handleFetchAllStudents = async () => {
        if (allStudents.length > 0 || isLoadingAllStudents) return;

        setIsLoadingAllStudents(true);
        try {
            const result = await getAllStudentsForSchool();
            if (result.success && result.data) {
                const filtered = result.data.students.filter(
                    (s: any) => s.student.id !== requestingStudentId && 
                               !selectedStudentIds.includes(s.student.id) &&
                               !otherPackageRequests.some((req) => req.student_data?.student?.id === s.student.id)
                );
                setAllStudents(filtered);
                setAllStudentsStatsMap(result.data.studentStatsMap);
            }
        } catch (error) {
            console.error("Error fetching all students:", error);
            toast.error("Failed to load students");
        } finally {
            setIsLoadingAllStudents(false);
        }
    };

    const handleRemoveStudent = (studentId: string, requestId?: string) => {
        if (requestId) {
            handleTogglePackageRequest(requestId);
        } else {
            handleToggleStudent(studentId);
        }
    };

    const handleSubmit = async () => {
        if (totalSelectedStudents !== capacity) {
            toast.error(`Please select exactly ${capacity} student${capacity > 1 ? "s" : ""}`);
            return;
        }

        if (!leaderStudentName.trim()) {
            toast.error("Leader student name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const allStudentIds = [requestingStudentId, ...selectedStudentIds].filter(Boolean) as string[];
            
            const result = await acceptStudentPackageAndCreateBooking({
                studentPackageId: invitation.id,
                studentIds: allStudentIds,
                teacherId: selectedTeacher?.schema.id,
                commissionId: selectedCommission?.id,
                leaderStudentName: leaderStudentName.trim(),
            });

            if (result.success) {
                if (selectedPackageRequestIds.length > 0) {
                    const updatePromises = selectedPackageRequestIds.map((requestId) =>
                        updateStudentPackageStatus(requestId, "accepted")
                    );
                    
                    const updateResults = await Promise.all(updatePromises);
                    const failedUpdates = updateResults.filter((r) => !r.success);
                    
                    if (failedUpdates.length > 0) {
                        console.warn("Some package request status updates failed:", failedUpdates);
                    }
                }
                
                setIsSuccess(true);
                toast.success("Booking created successfully!");
                setTimeout(() => {
                    onClose();
                    if (onSuccess) onSuccess();
                }, 2000);
            } else {
                toast.error(result.error || "Failed to create booking");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasTeacher = selectedTeacher && selectedCommission;
    const buttonText = hasTeacher ? "Create Lesson" : "Create Booking";
    const isButtonDisabled = isSubmitting || 
                            !leaderStudentName.trim() || 
                            totalSelectedStudents !== capacity;

    const filteredStudentsForTable = allStudents.filter(
        (s: any) => s.student.id !== requestingStudentId
    );

    const allOtherRequestsSelected = otherPackageRequests.length > 0 && 
        otherPackageRequests.every((req) => selectedPackageRequestIds.includes(req.id));

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-2xl bg-background rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                                >
                                    <X size={20} className="text-muted-foreground" />
                                </button>

                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center py-12 space-y-4"
                                        >
                                            <CheckCircle2 size={64} className="text-emerald-500" />
                                            <h2 className="text-2xl font-black uppercase">Booking Created!</h2>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex flex-col"
                                        >
                                            <ModalHeader startDate={requested_date_start} endDate={requested_date_end} />

                                            {isLoading ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 size={32} className="animate-spin text-primary" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <div className="p-6 md:p-8 space-y-8">
                                                        <PackageSection packageFormData={packageFormData} />

                                                        <StudentsSection
                                                            totalSelectedStudents={totalSelectedStudents}
                                                            capacity={capacity}
                                                            requestingStudentFormData={requestingStudentFormData}
                                                            selectedStudentIds={selectedStudentIds}
                                                            selectedStudentsData={selectedStudentsData}
                                                            otherPackageRequests={otherPackageRequests}
                                                            onRemoveStudent={handleRemoveStudent}
                                                        />

                                                        {!isSingleStudent && remainingCapacity > 0 && (
                                                            <div className="space-y-4">
                                                                {otherPackageRequests.length > 0 && !allOtherRequestsSelected && (
                                                                    <SelectOtherRequestSection
                                                                        otherPackageRequests={otherPackageRequests}
                                                                        selectedPackageRequestIds={selectedPackageRequestIds}
                                                                        onToggle={handleTogglePackageRequest}
                                                                    />
                                                                )}

                                                                {remainingCapacity > 0 && (
                                                                    <SelectAdditionalStudentsSection
                                                                        selectedStudentIds={selectedStudentIds}
                                                                        remainingCapacity={remainingCapacity}
                                                                        isExpanded={isStudentSelectionExpanded}
                                                                        onToggleExpand={() => {
                                                                            setIsStudentSelectionExpanded(!isStudentSelectionExpanded);
                                                                            if (!isStudentSelectionExpanded && allStudents.length === 0 && !isLoadingAllStudents) {
                                                                                handleFetchAllStudents();
                                                                            }
                                                                        }}
                                                                        isLoading={isLoadingAllStudents}
                                                                        allStudents={allStudents}
                                                                        filteredStudentsForTable={filteredStudentsForTable}
                                                                        allStudentsStatsMap={allStudentsStatsMap}
                                                                        capacity={capacity}
                                                                        requestingStudentId={requestingStudentId}
                                                                        selectedStudentsData={selectedStudentsData}
                                                                        otherPackageRequests={otherPackageRequests}
                                                                        onToggleStudent={handleToggleStudent}
                                                                        onRemoveStudent={handleRemoveStudent}
                                                                        onFetchAllStudents={handleFetchAllStudents}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        <LeaderNameInput
                                                            leaderStudentName={leaderStudentName}
                                                            onNameChange={setLeaderStudentName}
                                                        />

                                                        <TeacherSection
                                                            teachers={teachers}
                                                            selectedTeacher={selectedTeacher}
                                                            selectedCommission={selectedCommission}
                                                            onSelectTeacher={(teacher) => {
                                                                setSelectedTeacher(teacher);
                                                                setSelectedCommission(null);
                                                            }}
                                                            onSelectCommission={setSelectedCommission}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {!isSuccess && !isLoading && (
                                <SubmitButton
                                    isSubmitting={isSubmitting}
                                    isDisabled={isButtonDisabled}
                                    hasTeacher={hasTeacher}
                                    buttonText={buttonText}
                                    onSubmit={handleSubmit}
                                />
                            )}
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
