"use client";

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { RegisterTables } from "@/supabase/server";

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

interface RegisterContextValue {
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
}

const RegisterContext = createContext<RegisterContextValue | undefined>(undefined);

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

    // Optimistic update helpers
    const addStudent = useCallback((student: any) => {
        setData(prev => ({
            ...prev,
            students: [...prev.students, student]
        }));
    }, []);

    const addTeacher = useCallback((teacher: any) => {
        setData(prev => ({
            ...prev,
            teachers: [...prev.teachers, teacher]
        }));
    }, []);

    const addPackage = useCallback((pkg: any) => {
        setData(prev => ({
            ...prev,
            packages: [...prev.packages, pkg]
        }));
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
        addPackage
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
