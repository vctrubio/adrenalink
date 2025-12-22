"use client";

import { createContext, useContext, ReactNode } from "react";
import type { RegisterTables } from "@/supabase/server";

const RegisterContext = createContext<RegisterTables | undefined>(undefined);

export function RegisterProvider({
    children,
    data
}: {
    children: ReactNode;
    data: RegisterTables;
}) {
    return (
        <RegisterContext.Provider value={data}>
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
    return context;
}

/**
 * Hook to access school data only
 */
export function useSchool() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useSchool must be used within RegisterProvider");
    }
    return context.school;
}

/**
 * Hook to access packages data only
 */
export function usePackages() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("usePackages must be used within RegisterProvider");
    }
    return context.packages;
}

/**
 * Hook to access teachers data only
 */
export function useTeachers() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useTeachers must be used within RegisterProvider");
    }
    return context.teachers;
}

/**
 * Hook to access students data only
 */
export function useStudents() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useStudents must be used within RegisterProvider");
    }
    return context.students;
}

/**
 * Hook to access student booking stats
 */
export function useStudentBookingStats() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useStudentBookingStats must be used within RegisterProvider");
    }
    return context.studentBookingStats;
}

/**
 * Hook to access teacher lesson stats
 */
export function useTeacherLessonStats() {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error("useTeacherLessonStats must be used within RegisterProvider");
    }
    return context.teacherLessonStats;
}
