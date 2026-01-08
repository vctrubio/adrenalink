"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { RegisterTables } from "@/supabase/server";
import type { StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import type { TeacherFormData } from "@/src/components/forms/school/Teacher4SchoolForm";
import type { PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";

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
    // Data
    data: RegisterTables;
    refreshData: () => Promise<void>;
    isRefreshing: boolean;

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

export function RegisterProvider({
    children,
    initialData,
    refreshAction
}: {
    children: ReactNode;
    initialData: RegisterTables;
    refreshAction: () => Promise<RegisterTables>;
}) {
    const [data, setData] = useState<RegisterTables>(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [queues, setQueues] = useState<EntityQueues>({
        students: [],
        teachers: [],
        packages: [],
        bookings: []
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

    // Wrap setSubmitHandler to ensure stable reference if needed, 
    // but React's setState is already stable. 
    // We expose it as registerSubmitHandler for semantic clarity.
    const registerSubmitHandler = useCallback((handler: () => Promise<void>) => {
        setSubmitHandlerState(() => handler);
    }, []);

    const pathname = usePathname();
    const previousPathname = useRef(pathname);

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

    // Queue management
    const addToQueue = useCallback((type: keyof EntityQueues, item: QueueItem) => {
        setQueues(prev => ({
            ...prev,
            [type]: [...prev[type], item]
        }));
    }, []);

    const removeFromQueue = useCallback((type: keyof EntityQueues, id: string) => {
        setQueues(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    }, []);

    const setBookingForm = useCallback((updates: Partial<BookingFormState>) => {
        setBookingFormState(prev => ({ ...prev, ...updates }));
    }, []);

    const resetBookingForm = useCallback(() => {
        setBookingFormState(defaultBookingForm);
    }, []);

    const value: RegisterContextValue = {
        data,
        refreshData,
        isRefreshing,
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
            {children}
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
        isRefreshing: context.isRefreshing
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