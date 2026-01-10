"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import type { RegisterTables } from "@/supabase/server";
import type { StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import type { TeacherFormData } from "@/src/components/forms/school/Teacher4SchoolForm";
import type { PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";
import { masterBookingAdd } from "@/supabase/server/register";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";
import RegisterController from "@/src/app/(admin)/register/RegisterController";

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
    selectedPackage: any | null;
    selectedStudentIds: string[];
    selectedTeacher: any | null;
    selectedCommission: any | null;
    selectedReferral: any | null;
    dateRange: { startDate: string; endDate: string };
    leaderStudentId: string;
}

interface RegisterContextValue {
    // School context
    school: any;

    // Data
    data: RegisterTables;
    refreshData: () => Promise<void>;
    isRefreshing: boolean;
    updateDataStats: (updates: Partial<RegisterTables>) => void;

    // Queue - for recently added items
    queues: EntityQueues;
    addToQueue: (type: keyof EntityQueues, item: QueueItem) => void;
    removeFromQueue: (type: keyof EntityQueues, id: string) => void;

    // Booking form state
    bookingForm: {
        form: BookingFormState;
        setForm: (updates: Partial<BookingFormState>) => void;
        reset: () => void;
    };

    // Entity form states (for persistence across navigation)
    studentForm: StudentFormData | null;
    setStudentForm: (form: StudentFormData | null) => void;
    teacherForm: TeacherFormData | null;
    setTeacherForm: (form: TeacherFormData | null) => void;
    packageForm: PackageFormData | null;
    setPackageForm: (form: PackageFormData | null) => void;

    // Form submission coordination
    submitHandler: (() => Promise<void>) | undefined;
    registerSubmitHandler: (handler: () => Promise<void>) => void;
    isFormValid: boolean;
    setFormValidity: (valid: boolean) => void;

    // Section state
    shouldOpenAllSections: boolean;
    setShouldOpenAllSections: (open: boolean) => void;
}

const RegisterContext = createContext<RegisterContextValue | undefined>(undefined);

const defaultBookingForm: BookingFormState = {
    selectedPackage: null,
    selectedStudentIds: [],
    selectedTeacher: null,
    selectedCommission: null,
    selectedReferral: null,
    dateRange: { startDate: "", endDate: "" },
    leaderStudentId: "",
};

// Update stats after booking: increment bookingCount and set allBookingsCompleted to false
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

    // Booking form state
    const [bookingForm, setBookingFormState] = useState<BookingFormState>(defaultBookingForm);

    // Entity form states
    const [studentForm, setStudentForm] = useState<StudentFormData | null>(null);
    const [teacherForm, setTeacherForm] = useState<TeacherFormData | null>(null);
    const [packageForm, setPackageForm] = useState<PackageFormData | null>(null);

    // Generic Form Coordination
    const [submitHandler, setSubmitHandlerState] = useState<(() => Promise<void>) | undefined>();
    const [isFormValid, setFormValidity] = useState(false);

    // Section state
    const [shouldOpenAllSections, setShouldOpenAllSections] = useState(false);

    // Booking submission state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Wrap setSubmitHandler to ensure stable reference if needed,
    // but React's setState is already stable.
    // We expose it as registerSubmitHandler for semantic clarity.
    const registerSubmitHandler = useCallback((handler: () => Promise<void>) => {
        setSubmitHandlerState(() => handler);
    }, []);

    const previousPathname = useRef(pathname);
    const handleBookingSubmitRef = useRef<(() => Promise<void>) | null>(null);

    // Re-fetch on route transitions (not on page reload)
    useEffect(() => {
        if (previousPathname.current !== pathname && pathname.startsWith("/register")) {
            refreshData();
            previousPathname.current = pathname;
        }
    }, [pathname]);

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

    const updateDataStats = useCallback((updates: Partial<RegisterTables>) => {
        setData((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    // Queue management
    const addToQueue = useCallback((type: keyof EntityQueues, item: QueueItem) => {
        setQueues((prev) => ({
            ...prev,
            [type]: [...prev[type], item],
        }));
    }, []);

    const removeFromQueue = useCallback((type: keyof EntityQueues, id: string) => {
        setQueues((prev) => ({
            ...prev,
            [type]: prev[type].filter((item) => item.id !== id),
        }));
    }, []);

    const setBookingForm = useCallback((updates: Partial<BookingFormState>) => {
        setBookingFormState((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetBookingForm = useCallback(() => {
        setBookingFormState(defaultBookingForm);
    }, []);

    // Get selected students
    const selectedStudents = data.students.filter((s) => bookingForm.selectedStudentIds.includes(s.student?.id)).map((s) => s.student);

    // Determine active form based on pathname
    const activeForm: ActiveForm = useMemo(() => {
        if (pathname === "/register") return "booking";
        if (pathname === "/register/student") return "student";
        if (pathname === "/register/teacher") return "teacher";
        if (pathname === "/register/package") return "package";
        return "booking";
    }, [pathname]);

    // Determine if we can create booking
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

    // Handle booking submission
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

            // Update stats locally (booking count +1, mark as not all completed)
            const updatedData = updateStatsAfterBooking(data, bookingForm.selectedStudentIds);
            setData(updatedData);

            // Add to queue
            addToQueue("bookings", {
                id: result.data.booking.id,
                name: leaderStudentName,
                timestamp: Date.now(),
                type: "booking",
            });

            // Success toast
            toast.success(`Booking created: ${leaderStudentName}`);

            // Signal to open all sections
            setShouldOpenAllSections(true);

            // Reset form
            resetBookingForm();
            setLoading(false);
        } catch (err) {
            const errorMessage = "An unexpected error occurred";
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    }, [bookingForm, data, getLeaderStudentName, addToQueue]);

    // Keep ref updated with latest handler
    useEffect(() => {
        handleBookingSubmitRef.current = handleBookingSubmit;
    }, [handleBookingSubmit]);

    // Register booking submission handler when on booking page
    useEffect(() => {
        if (activeForm === "booking") {
            registerSubmitHandler(() => handleBookingSubmitRef.current());
            setFormValidity(canCreateBooking);
        }
    }, [activeForm, canCreateBooking]);

    const value: RegisterContextValue = {
        school,
        data,
        refreshData,
        isRefreshing,
        updateDataStats,
        queues,
        addToQueue,
        removeFromQueue,
        bookingForm: {
            form: bookingForm,
            setForm: setBookingForm,
            reset: resetBookingForm,
        },
        studentForm,
        setStudentForm,
        teacherForm,
        setTeacherForm,
        packageForm,
        setPackageForm,
        submitHandler,
        registerSubmitHandler,
        isFormValid,
        setFormValidity,
        shouldOpenAllSections,
        setShouldOpenAllSections,
    };

    return (
        <RegisterContext.Provider value={value}>
            <RegisterFormLayout
                controller={
                    <RegisterController
                        school={school}
                        activeForm={activeForm}
                        selectedPackage={bookingForm.selectedPackage}
                        selectedStudents={selectedStudents}
                        selectedReferral={bookingForm.selectedReferral}
                        selectedTeacher={bookingForm.selectedTeacher}
                        selectedCommission={bookingForm.selectedCommission}
                        dateRange={bookingForm.dateRange}
                        onReset={resetBookingForm}
                        loading={loading}
                        leaderStudentId={bookingForm.leaderStudentId}
                        error={error}
                        submitHandler={submitHandler}
                        isFormValid={activeForm === "booking" ? canCreateBooking : isFormValid}
                        referrals={data.referrals}
                    />
                }
                form={children}
            />
        </RegisterContext.Provider>
    );
}

// ... hooks ...

export function useRegisterData(): RegisterTables {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterData must be used within RegisterProvider");
    return context.data;
}

export function useRegisterActions() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterActions must be used within RegisterProvider");
    return {
        addToQueue: context.addToQueue,
        removeFromQueue: context.removeFromQueue,
        refreshData: context.refreshData,
        isRefreshing: context.isRefreshing,
    };
}

export function useRegisterQueues() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterQueues must be used within RegisterProvider");
    return context.queues;
}

export function useBookingForm() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useBookingForm must be used within RegisterProvider");
    return context.bookingForm;
}

export function useStudentFormState() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useStudentFormState must be used within RegisterProvider");
    return {
        form: context.studentForm,
        setForm: context.setStudentForm,
    };
}

export function useTeacherFormState() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useTeacherFormState must be used within RegisterProvider");
    return {
        form: context.teacherForm,
        setForm: context.setTeacherForm,
    };
}

export function usePackageFormState() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("usePackageFormState must be used within RegisterProvider");
    return {
        form: context.packageForm,
        setForm: context.setPackageForm,
    };
}

/**
 * Hook for pages to register their form submission logic
 */
export function useFormRegistration() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useFormRegistration must be used within RegisterProvider");
    return {
        submitHandler: context.submitHandler,
        registerSubmitHandler: context.registerSubmitHandler,
        isFormValid: context.isFormValid,
        setFormValidity: context.setFormValidity,
    };
}

export function useShouldOpenSections() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useShouldOpenSections must be used within RegisterProvider");
    return {
        shouldOpenAllSections: context.shouldOpenAllSections,
        setShouldOpenAllSections: context.setShouldOpenAllSections,
    };
}

export function useUpdateDataStats() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useUpdateDataStats must be used within RegisterProvider");
    return context.updateDataStats;
}

export function useRegisterSchool() {
    const context = useContext(RegisterContext);
    if (!context) throw new Error("useRegisterSchool must be used within RegisterProvider");
    return context.school;
}
