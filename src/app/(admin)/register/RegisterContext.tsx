"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { RegisterTables } from "@/supabase/server";
import type { StudentFormData } from "@/src/components/forms/Student4SchoolForm";
import type { TeacherFormData } from "@/src/components/forms/Teacher4SchoolForm";
import type { PackageFormData } from "@/src/components/forms/Package4SchoolForm";

interface QueueItem {
    id: string;
    name: string;
    timestamp: number;
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
    // Data management
    data: RegisterTables;
    setData: (data: RegisterTables) => void;
    refreshData: () => Promise<void>;
    isRefreshing: boolean;

    // Entity queues
    queues: EntityQueues;
    addToQueue: (type: keyof EntityQueues, item: QueueItem) => void;
    removeFromQueue: (type: keyof EntityQueues, id: string) => void;
    clearQueue: (type: keyof EntityQueues) => void;

    // Optimistic updates
    addStudent: (student: any) => void;
    addTeacher: (teacher: any) => void;
    addPackage: (pkg: any) => void;

    // Booking form state
    bookingForm: BookingFormState;
    setBookingForm: (form: Partial<BookingFormState>) => void;
    resetBookingForm: () => void;

    // Entity form states
    studentForm: StudentFormData | null;
    setStudentForm: (form: StudentFormData | null) => void;
    teacherForm: TeacherFormData | null;
    setTeacherForm: (form: TeacherFormData | null) => void;
    packageForm: PackageFormData | null;
    setPackageForm: (form: PackageFormData | null) => void;

    // Form validation and submission
    isStudentFormValid: boolean;
    setStudentFormValid: (valid: boolean) => void;
    isTeacherFormValid: boolean;
    setTeacherFormValid: (valid: boolean) => void;
    isPackageFormValid: boolean;
    setPackageFormValid: (valid: boolean) => void;
    onStudentSubmit?: () => Promise<void>;
    setStudentSubmit: (handler: () => Promise<void>) => void;
    onTeacherSubmit?: () => Promise<void>;
    setTeacherSubmit: (handler: () => Promise<void>) => void;
    onPackageSubmit?: () => Promise<void>;
    setPackageSubmit: (handler: () => Promise<void>) => void;
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

    // Form validation states
    const [isStudentFormValid, setStudentFormValid] = useState(false);
    const [isTeacherFormValid, setTeacherFormValid] = useState(false);
    const [isPackageFormValid, setPackageFormValid] = useState(false);

    // Form submission handlers
    const [onStudentSubmit, setStudentSubmit] = useState<(() => Promise<void>) | undefined>();
    const [onTeacherSubmit, setTeacherSubmit] = useState<(() => Promise<void>) | undefined>();
    const [onPackageSubmit, setPackageSubmit] = useState<(() => Promise<void>) | undefined>();

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

    const clearQueue = useCallback((type: keyof EntityQueues) => {
        setQueues(prev => ({
            ...prev,
            [type]: []
        }));
    }, []);

    // Optimistic update helpers - add to beginning so they appear at top
    const addStudent = useCallback((student: any) => {
        setData(prev => ({
            ...prev,
            students: [student, ...prev.students]
        }));
    }, []);

    const addTeacher = useCallback((teacher: any) => {
        setData(prev => ({
            ...prev,
            teachers: [teacher, ...prev.teachers]
        }));
    }, []);

    const addPackage = useCallback((pkg: any) => {
        setData(prev => ({
            ...prev,
            packages: [pkg, ...prev.packages]
        }));
    }, []);

    // Booking form update function
    const setBookingForm = useCallback((updates: Partial<BookingFormState>) => {
        setBookingFormState(prev => ({ ...prev, ...updates }));
    }, []);

    // Reset booking form
    const resetBookingForm = useCallback(() => {
        setBookingFormState(defaultBookingForm);
    }, []);

    const value = {
        data,
        setData,
        refreshData,
        isRefreshing,
        queues,
        addToQueue,
        removeFromQueue,
        clearQueue,
        addStudent,
        addTeacher,
        addPackage,
        bookingForm,
        setBookingForm,
        resetBookingForm,
        studentForm,
        setStudentForm,
        teacherForm,
        setTeacherForm,
        packageForm,
        setPackageForm,
        isStudentFormValid,
        setStudentFormValid,
        isTeacherFormValid,
        setTeacherFormValid,
        isPackageFormValid,
        setPackageFormValid,
        onStudentSubmit,
        setStudentSubmit,
        onTeacherSubmit,
        setTeacherSubmit,
        onPackageSubmit,
        setPackageSubmit
    };

    return (
        <RegisterContext.Provider value={value}>
            {children}
        </RegisterContext.Provider>
    );
}

/**
 * Hook to access all register data
 */
export function useRegisterData(): RegisterTables {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useRegisterData must be used within RegisterProvider");
    }
    return context.data;
}

/**
 * Hook to access register actions (optimistic updates, queue management, refresh)
 */
export function useRegisterActions() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useRegisterActions must be used within RegisterProvider");
    }
    return {
        addStudent: context.addStudent,
        addTeacher: context.addTeacher,
        addPackage: context.addPackage,
        addToQueue: context.addToQueue,
        removeFromQueue: context.removeFromQueue,
        clearQueue: context.clearQueue,
        refreshData: context.refreshData,
        isRefreshing: context.isRefreshing
    };
}

/**
 * Hook to access entity queues
 */
export function useRegisterQueues() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useRegisterQueues must be used within RegisterProvider");
    }
    return context.queues;
}

/**
 * Hook to access school data only
 */
export function useSchool() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useSchool must be used within RegisterProvider");
    }
    return context.data.school;
}

/**
 * Hook to access packages data only
 */
export function usePackages() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("usePackages must be used within RegisterProvider");
    }
    return context.data.packages;
}

/**
 * Hook to access teachers data only
 */
export function useTeachers() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useTeachers must be used within RegisterProvider");
    }
    return context.data.teachers;
}

/**
 * Hook to access students data only
 */
export function useStudents() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useStudents must be used within RegisterProvider");
    }
    return context.data.students;
}

/**
 * Hook to access student booking stats
 */
export function useStudentBookingStats() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useStudentBookingStats must be used within RegisterProvider");
    }
    return context.data.studentBookingStats;
}

/**
 * Hook to access teacher lesson stats
 */
export function useTeacherLessonStats() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useTeacherLessonStats must be used within RegisterProvider");
    }
    return context.data.teacherLessonStats;
}

/**
 * Hook to access and update booking form state
 */
export function useBookingForm() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useBookingForm must be used within RegisterProvider");
    }
    // Return separate values instead of an object to avoid creating new references
    return {
        form: context.bookingForm,
        setForm: context.setBookingForm,
        reset: context.resetBookingForm,
    };
}

/**
 * Hook to access and update student form state
 */
export function useStudentFormState() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useStudentFormState must be used within RegisterProvider");
    }
    return {
        form: context.studentForm,
        setForm: context.setStudentForm,
    };
}

/**
 * Hook to access and update teacher form state
 */
export function useTeacherFormState() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useTeacherFormState must be used within RegisterProvider");
    }
    return {
        form: context.teacherForm,
        setForm: context.setTeacherForm,
    };
}

/**
 * Hook to access and update package form state
 */
export function usePackageFormState() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("usePackageFormState must be used within RegisterProvider");
    }
    return {
        form: context.packageForm,
        setForm: context.setPackageForm,
    };
}

/**
 * Hook to access and manage form submission
 */
export function useFormSubmission() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useFormSubmission must be used within RegisterProvider");
    }
    return {
        isStudentFormValid: context.isStudentFormValid,
        setStudentFormValid: context.setStudentFormValid,
        onStudentSubmit: context.onStudentSubmit,
        setStudentSubmit: context.setStudentSubmit,
        isTeacherFormValid: context.isTeacherFormValid,
        setTeacherFormValid: context.setTeacherFormValid,
        onTeacherSubmit: context.onTeacherSubmit,
        setTeacherSubmit: context.setTeacherSubmit,
        isPackageFormValid: context.isPackageFormValid,
        setPackageFormValid: context.setPackageFormValid,
        onPackageSubmit: context.onPackageSubmit,
        setPackageSubmit: context.setPackageSubmit,
    };
}
