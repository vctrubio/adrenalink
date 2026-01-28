"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import type { RegisterTables } from "@/supabase/server";
import type { StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import type { TeacherFormData } from "@/src/components/forms/school/Teacher4SchoolForm";
import type { PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";
import { masterBookingAdd } from "@/supabase/server/register";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";

interface QueueItem {
    id: string;
    name: string;
    timestamp: number;
    type: "student" | "teacher" | "package" | "booking";
    metadata?: Record<string, any>;
}

interface EntityQueues {
    students: QueueItem[];
    teachers: QueueItem[];
    packages: QueueItem[];
    bookings: QueueItem[];
}

interface BookingFormState {
    selectedEquipmentCategory: string | null;
    selectedPackage: any | null;
    selectedStudentIds: string[];
    selectedTeacher: any | null;
    selectedCommission: any | null;
    selectedReferral: any | null;
    dateRange: { startDate: string; endDate: string };
    leaderStudentId: string;
}

interface RegisterContextValue {
    school: any;
    data: {
        tables: RegisterTables;
        refresh: () => Promise<void>;
        isRefreshing: boolean;
        queues: EntityQueues;
        addToQueue: (type: keyof EntityQueues, item: QueueItem) => void;
        removeFromQueue: (type: keyof EntityQueues, id: string) => void;
        clearQueue: () => void;
    };
    forms: {
        booking: {
            state: BookingFormState;
            update: (updates: Partial<BookingFormState>) => void;
            reset: () => void;
            submit: {
                handler: (() => Promise<void>) | undefined;
                register: (handler: () => Promise<void>) => void;
                isValid: boolean;
                setValidity: (valid: boolean) => void;
            };
        };
        entities: {
            student: { state: StudentFormData | null; update: (form: StudentFormData | null) => void };
            teacher: { state: TeacherFormData | null; update: (form: TeacherFormData | null) => void };
            package: { state: PackageFormData | null; update: (form: PackageFormData | null) => void };
        };
    };
    actions: {
        handlePostCreation: (args: {
            entityId: string;
            entityType: "student" | "teacher" | "package";
            closeDialog: () => void;
            onSelectId: () => void;
            onRefresh: () => Promise<void>;
            onAddToQueue: () => void;
            setFormData: (data: any) => void;
            defaultForm: any;
            metadata?: any;
        }) => Promise<void>;
        selectFromQueue: (item: QueueItem) => void;
        handleEntityCreation: (args: {
            isFormValid: boolean;
            entityName: string;
            createFn: () => Promise<{ success: boolean; data?: any; error?: string }>;
            onSuccess: (data: any) => Promise<void>;
            successMessage: string;
            onError?: (error: string) => void;
        }) => Promise<{ success: boolean; data?: any }>;
    };
    ui: {
        shouldOpenAllSections: boolean;
        setShouldOpenAllSections: (open: boolean) => void;
    };
}

const RegisterContext = createContext<RegisterContextValue | undefined>(undefined);

const defaultBookingForm: BookingFormState = {
    selectedEquipmentCategory: null,
    selectedPackage: null,
    selectedStudentIds: [],
    selectedTeacher: null,
    selectedCommission: null,
    selectedReferral: null,
    dateRange: { startDate: "", endDate: "" },
    leaderStudentId: "",
};

const updateStatsAfterBooking = (currentData: RegisterTables, studentIds: string[]) => {
    const updated = { ...currentData };
    studentIds.forEach((studentId) => {
        if (updated.studentBookingStats?.[studentId]) {
            updated.studentBookingStats[studentId].bookingCount += 1;
            updated.studentBookingStats[studentId].allBookingsCompleted = false;
        }
    });
    return updated;
};

type ActiveForm = "booking" | "student" | "teacher" | "package";

export function RegisterProvider({
    children,
    initialData,
    refreshAction,
    school,
}: {
    children: ReactNode;
    initialData: RegisterTables;
    refreshAction: () => Promise<RegisterTables>;
    school: any;
}) {
    const pathname = usePathname();
    const [data, setData] = useState<RegisterTables>(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [queues, setQueues] = useState<EntityQueues>({
        students: [],
        teachers: [],
        packages: [],
        bookings: [],
    });

    const [bookingForm, setBookingFormState] = useState<BookingFormState>(defaultBookingForm);
    const [studentForm, setStudentForm] = useState<StudentFormData | null>(null);
    const [teacherForm, setTeacherForm] = useState<TeacherFormData | null>(null);
    const [packageForm, setPackageForm] = useState<PackageFormData | null>(null);

    const [submitHandler, setSubmitHandlerState] = useState<(() => Promise<void>) | undefined>();
    const [isFormValid, setFormValidity] = useState(false);
    const [shouldOpenAllSections, setShouldOpenAllSections] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { refetch: refetchTeachers } = useSchoolTeachers();
    const handleBookingSubmitRef = useRef<(() => Promise<void>) | null>(null);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const fresh = await refreshAction();
            setData(fresh);
        } catch (error) {
            console.error("Failed to refresh register data:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshAction]);

    useEffect(() => {
        if (pathname.startsWith("/register")) {
            refreshData();
        }
    }, [pathname, refreshData]);

    const addToQueue = useCallback((type: keyof EntityQueues, item: QueueItem) => {
        setQueues((prev) => ({ ...prev, [type]: [...prev[type], item] }));
    }, []);

    const removeFromQueue = useCallback((type: keyof EntityQueues, id: string) => {
        setQueues((prev) => ({ ...prev, [type]: prev[type].filter((item) => item.id !== id) }));
    }, []);

    const clearQueue = useCallback(() => {
        setQueues({
            students: [],
            teachers: [],
            packages: [],
            bookings: [],
        });
    }, []);

    const setBookingForm = useCallback((updates: Partial<BookingFormState>) => {
        setBookingFormState((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetBookingForm = useCallback(() => setBookingFormState(defaultBookingForm), []);

    const registerSubmitHandler = useCallback((handler: () => Promise<void>) => {
        setSubmitHandlerState(() => handler);
    }, []);

    const selectFromQueue = useCallback(
        (item: QueueItem) => {
            if (item.type === "student") {
                if (bookingForm.selectedStudentIds.includes(item.id)) {
                    toast.error("Student already selected");
                    return;
                }
                if (
                    bookingForm.selectedPackage &&
                    bookingForm.selectedStudentIds.length >= bookingForm.selectedPackage.capacityStudents
                ) {
                    toast.error(`Maximum ${bookingForm.selectedPackage.capacityStudents} students for this package`);
                    return;
                }
                setBookingFormState((prev) => ({ ...prev, selectedStudentIds: [...prev.selectedStudentIds, item.id] }));
            } else if (item.type === "teacher") {
                if (bookingForm.selectedTeacher?.schema?.id === item.id) {
                    toast.error("Teacher already selected");
                    return;
                }
                setBookingFormState((prev) => ({
                    ...prev,
                    selectedTeacher: item.metadata,
                    selectedCommission: item.metadata?.schema?.commissions?.[0] || null,
                }));
            } else if (item.type === "package") {
                if (bookingForm.selectedPackage?.id === item.id) {
                    toast.error("Package already selected");
                    return;
                }
                setBookingFormState((prev) => ({
                    ...prev,
                    selectedPackage: item.metadata,
                    selectedEquipmentCategory: item.metadata?.categoryEquipment,
                }));
            }
        },
        [bookingForm],
    );

    const handlePostCreation = useCallback(
        async ({
            entityId,
            entityType,
            closeDialog,
            onSelectId,
            onRefresh,
            onAddToQueue,
            setFormData,
            defaultForm,
            metadata,
        }: {
            entityId: string;
            entityType: "student" | "teacher" | "package";
            closeDialog: () => void;
            onSelectId: () => void;
            onRefresh: () => Promise<void>;
            onAddToQueue: () => void;
            setFormData: (data: any) => void;
            defaultForm: any;
            metadata?: any;
        }) => {
            // 1. Common tasks: Refresh data
            await onRefresh();

            // 2. Path-specific logic
            if (pathname === "/register") {
                closeDialog();
                onSelectId();
            } else {
                onAddToQueue();
            }

            // 3. Reset the form data AFTER closing the dialog (if applicable)
            setFormData(defaultForm);
        },
        [pathname],
    );

    const handleEntityCreation = useCallback(
        async ({
            isFormValid,
            entityName,
            createFn,
            onSuccess,
            successMessage,
            onError,
        }: {
            isFormValid: boolean;
            entityName: string;
            createFn: () => Promise<{ success: boolean; data?: any; error?: string }>;
            onSuccess: (data: any) => Promise<void>;
            successMessage: string;
            onError?: (error: string) => void;
        }) => {
            if (!isFormValid) {
                toast.error("Please fill all required fields");
                return { success: false };
            }
            try {
                const result = await createFn();
                if (!result.success) {
                    const error = result.error || `Failed to create ${entityName}`;
                    toast.error(error);
                    onError?.(error);
                    return { success: false };
                }
                toast.success(successMessage);
                await onSuccess(result.data);
                return { success: true, data: result.data };
            } catch (error) {
                console.error(`${entityName} creation error:`, error);
                const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error(errorMessage);
                onError?.(errorMessage);
                return { success: false };
            }
        },
        [],
    );

    const selectedStudents = useMemo(() => 
        data.students.filter((s) => bookingForm.selectedStudentIds.includes(s.student?.id)).map((s) => s.student),
    [data.students, bookingForm.selectedStudentIds]);

    const activeForm: ActiveForm = useMemo(() => {
        if (pathname === "/register") return "booking";
        if (pathname === "/register/student") return "student";
        if (pathname === "/register/teacher") return "teacher";
        if (pathname === "/register/package") return "package";
        return "booking";
    }, [pathname]);

    const canCreateBooking = useMemo(() => {
        const f = bookingForm;
        return !!(
            f.selectedPackage &&
            f.selectedStudentIds.length > 0 &&
            f.selectedStudentIds.length === f.selectedPackage.capacityStudents &&
            f.dateRange.startDate &&
            f.dateRange.endDate &&
            (!f.selectedTeacher || f.selectedCommission)
        );
    }, [bookingForm]);

    const getLeaderStudentName = useCallback(() => {
        const leaderStudent = selectedStudents.find((s) => s.id === bookingForm.leaderStudentId);
        return leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "";
    }, [selectedStudents, bookingForm.leaderStudentId]);

    const handleBookingSubmit = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const leaderStudentName = getLeaderStudentName();
            const result = await masterBookingAdd(
                bookingForm.selectedPackage.id,
                bookingForm.selectedStudentIds,
                bookingForm.dateRange.startDate,
                bookingForm.dateRange.endDate,
                bookingForm.selectedTeacher?.schema.id,
                bookingForm.selectedCommission?.id,
                bookingForm.selectedReferral?.id,
                leaderStudentName,
            );
            if (!result.success) {
                const errorMessage = result.error || "Failed to create booking";
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
                return;
            }
            setData(prev => updateStatsAfterBooking(prev, bookingForm.selectedStudentIds));
            addToQueue("bookings", {
                id: result.data.booking.id,
                name: leaderStudentName,
                timestamp: Date.now(),
                type: "booking",
            });
            if (bookingForm.selectedTeacher) refetchTeachers();
            toast.success(`Booking created: ${leaderStudentName}`);
            setShouldOpenAllSections(true);
            resetBookingForm();
            setLoading(false);
        } catch (err) {
            setError("An unexpected error occurred");
            toast.error("An unexpected error occurred");
            setLoading(false);
        }
    }, [bookingForm, getLeaderStudentName, addToQueue, refetchTeachers, resetBookingForm]);

    useEffect(() => {
        handleBookingSubmitRef.current = handleBookingSubmit;
    }, [handleBookingSubmit]);

    useEffect(() => {
        if (activeForm === "booking") {
            registerSubmitHandler(() => handleBookingSubmitRef.current?.() || Promise.resolve());
            setFormValidity(canCreateBooking);
        }
    }, [activeForm, canCreateBooking, registerSubmitHandler]);

    const dataValue = useMemo(() => ({
        tables: data,
        refresh: refreshData,
        isRefreshing,
        queues,
        addToQueue,
        removeFromQueue,
        clearQueue,
    }), [data, refreshData, isRefreshing, queues, addToQueue, removeFromQueue, clearQueue]);

    const formsValue = useMemo(() => ({
        booking: {
            state: bookingForm,
            update: setBookingForm,
            reset: resetBookingForm,
            submit: {
                handler: submitHandler,
                register: registerSubmitHandler,
                isValid: isFormValid,
                setValidity: setFormValidity,
            },
        },
        entities: {
            student: { state: studentForm, update: setStudentForm },
            teacher: { state: teacherForm, update: setTeacherForm },
            package: { state: packageForm, update: setPackageForm },
        },
    }), [bookingForm, setBookingForm, resetBookingForm, submitHandler, registerSubmitHandler, isFormValid, studentForm, teacherForm, packageForm]);

    const actionsValue = useMemo(() => ({
        handlePostCreation,
        handleEntityCreation,
        selectFromQueue,
    }), [handlePostCreation, handleEntityCreation, selectFromQueue]);

    const uiValue = useMemo(() => ({
        shouldOpenAllSections,
        setShouldOpenAllSections,
    }), [shouldOpenAllSections]);

    const contextValue: RegisterContextValue = useMemo(() => ({
        school,
        data: dataValue,
        forms: formsValue,
        actions: actionsValue,
        ui: uiValue,
    }), [school, dataValue, formsValue, actionsValue, uiValue]);

    return (
        <RegisterContext.Provider value={contextValue}>
            {children}
        </RegisterContext.Provider>
    );
}

export function useRegisterData() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterData must be used within RegisterProvider");
    return context.data;
}

export function useRegisterActions() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterActions must be used within RegisterProvider");
    return {
        addToQueue: context.data.addToQueue,
        removeFromQueue: context.data.removeFromQueue,
        clearQueue: context.data.clearQueue,
        selectFromQueue: context.actions.selectFromQueue,
        refreshData: context.data.refresh,
        isRefreshing: context.data.isRefreshing,
        handlePostCreation: context.actions.handlePostCreation,
        handleEntityCreation: context.actions.handleEntityCreation,
    };
}

export function useRegisterQueues() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterQueues must be used within RegisterProvider");
    return context.data.queues;
}

export function useBookingForm() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useBookingForm must be used within RegisterProvider");
    return {
        form: context.forms.booking.state,
        setForm: context.forms.booking.update,
        reset: context.forms.booking.reset,
    };
}

export function useStudentFormState() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useStudentFormState must be used within RegisterProvider");
    return {
        form: context.forms.entities.student.state,
        setForm: context.forms.entities.student.update,
    };
}

export function useTeacherFormState() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useTeacherFormState must be used within RegisterProvider");
    return {
        form: context.forms.entities.teacher.state,
        setForm: context.forms.entities.teacher.update,
    };
}

export function usePackageFormState() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("usePackageFormState must be used within RegisterProvider");
    return {
        form: context.forms.entities.package.state,
        setForm: context.forms.entities.package.update,
    };
}

export function useFormRegistration() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useFormRegistration must be used within RegisterProvider");
    return {
        submitHandler: context.forms.booking.submit.handler,
        registerSubmitHandler: context.forms.booking.submit.register,
        isFormValid: context.forms.booking.submit.isValid,
        setFormValidity: context.forms.booking.submit.setValidity,
    };
}

export function useShouldOpenSections() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useShouldOpenSections must be used within RegisterProvider");
    return {
        shouldOpenAllSections: context.ui.shouldOpenAllSections,
        setShouldOpenAllSections: context.ui.setShouldOpenAllSections,
    };
}

export function useRegisterSchool() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterSchool must be used within RegisterProvider");
    return context.school;
}