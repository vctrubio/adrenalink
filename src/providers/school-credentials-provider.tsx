"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SchoolCredentials } from "@/types/credentials";

interface SchoolCredentialsContextType {
    credentials: SchoolCredentials | null;
}

const SchoolCredentialsContext = createContext<SchoolCredentialsContextType | undefined>(undefined);

export interface SchoolCredentialsProviderProps {
    credentials: SchoolCredentials | null;
    children: ReactNode;
}

export function SchoolCredentialsProvider({
    credentials,
    children,
}: SchoolCredentialsProviderProps) {
    return (
        <SchoolCredentialsContext.Provider value={{ credentials }}>
            {children}
        </SchoolCredentialsContext.Provider>
    );
}

export function useSchoolCredentials(): SchoolCredentials | null {
    const context = useContext(SchoolCredentialsContext);
    if (context === undefined) {
        console.warn(
            "useSchoolCredentials must be used within a SchoolCredentialsProvider"
        );
        return null;
    }
    return context.credentials;
}
