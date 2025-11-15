"use client";

import { createContext, useContext, ReactNode } from "react";
import type { RegisterData } from "@/actions/register-action";

interface RegisterContextType extends RegisterData {
    // Expose all RegisterData properties directly
    school: RegisterData["school"];
    packages: RegisterData["packages"];
    teachers: RegisterData["teachers"];
    students: RegisterData["students"];
    referrals: RegisterData["referrals"];
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export function RegisterProvider({ 
    children, 
    data 
}: { 
    children: ReactNode; 
    data: RegisterData;
}) {
    // Provide the complete data object with direct property access
    const contextValue: RegisterContextType = {
        school: data.school,
        packages: data.packages,
        teachers: data.teachers,
        students: data.students,
        referrals: data.referrals,
    };

    return (
        <RegisterContext.Provider value={contextValue}>
            {children}
        </RegisterContext.Provider>
    );
}

/**
 * Hook to access all register data
 * Returns the complete RegisterData object
 */
export function useRegisterData(): RegisterData {
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
