"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SchoolCredentials } from "@/types/credentials";

const SchoolCredentialsContext = createContext<{ credentials: SchoolCredentials } | undefined>(undefined);

export interface SchoolCredentialsProviderProps {
    credentials: SchoolCredentials | null;
    children: ReactNode;
}

export function SchoolCredentialsProvider({ credentials, children }: SchoolCredentialsProviderProps) {
    if (!credentials) {
        // Allow rendering children even without credentials (e.g. for /welcome page)
        return <>{children}</>;
    }

    return <SchoolCredentialsContext.Provider value={{ credentials }}>{children}</SchoolCredentialsContext.Provider>;
}

export function useSchoolCredentials(): SchoolCredentials {
    const context = useContext(SchoolCredentialsContext);
    if (context === undefined) {
        throw new Error("useSchoolCredentials must be used within a SchoolCredentialsProvider with valid credentials");
    }
    return context.credentials;
}
