"use client";

import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { getTeachers } from "@/actions/teachers-action";
import type { TeacherModel } from "@/backend/models";

interface SchoolTeachersContextType {
    teachers: TeacherModel[];
    allTeachers: TeacherModel[];
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
    const [allTeachers, setAllTeachers] = useState<TeacherModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getTeachers();

            if (result.success && result.data) {
                // Store all teachers (including inactive)
                setAllTeachers(result.data);
                // Filter for active teachers only (for classboard/default use)
                const activeTeachers = result.data.filter((teacher) => teacher.schema.active);
                setTeachers(activeTeachers);
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

    const contextValue = useMemo(
        () => ({
            teachers,
            allTeachers,
            loading,
            error,
            refetch: fetchTeachers,
        }),
        [teachers, allTeachers, loading, error],
    );

    return <SchoolTeachersContext.Provider value={contextValue}>{children}</SchoolTeachersContext.Provider>;
}
