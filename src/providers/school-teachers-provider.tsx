"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";
import { getTeachers } from "@/actions/teachers-action";
import type { TeacherModel } from "@/backend/models";

interface SchoolTeachersContextType {
    teachers: TeacherModel[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const SchoolTeachersContext = createContext<SchoolTeachersContextType | undefined>(undefined);

interface SchoolTeachersProviderProps {
    children: ReactNode;
}

export function SchoolTeachersProvider({ children }: SchoolTeachersProviderProps) {
    const [teachers, setTeachers] = useState<TeacherModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getTeachers();

            if (result.success && result.data) {
                setTeachers(result.data);
            } else {
                setError(result.error || "Failed to fetch teachers");
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Error fetching teachers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    return (
        <SchoolTeachersContext.Provider value={{ teachers, loading, error, refetch: fetchTeachers }}>
            {children}
        </SchoolTeachersContext.Provider>
    );
}
