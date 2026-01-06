"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SchoolCredentials } from "@/types/credentials";

const SchoolCredentialsContext = createContext<{ credentials: SchoolCredentials } | undefined>(undefined);

export interface SchoolCredentialsProviderProps {
    credentials: SchoolCredentials | null;
    children: ReactNode;
}

export function SchoolCredentialsProvider({
    credentials,
    children,
}: SchoolCredentialsProviderProps) {
    const router = useRouter();

    // If no credentials, redirect to no-credentials page
    // if (!credentials) {
    //     router.push("/no-credentials");
    //     return null;
    // }

    if (!credentials) {
        console.log("ERROR: SchoolCredentialsProvider missing credentials");
    }

    return (
        <SchoolCredentialsContext.Provider value={{ credentials }}>
            {children}
        </SchoolCredentialsContext.Provider>
    );
}

export function useSchoolCredentials(): SchoolCredentials {
    const context = useContext(SchoolCredentialsContext);
    if (context === undefined) {
        throw new Error(
            "useSchoolCredentials must be used within a SchoolCredentialsProvider with valid credentials"
        );
    }
    return context.credentials;
}
