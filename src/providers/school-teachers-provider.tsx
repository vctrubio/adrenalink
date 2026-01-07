"use client";

import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { getSchoolTeachersProviderAction } from "@/actions/teachers-action";
import type { TeacherProvider } from "@/supabase/server/teachers";

interface SchoolTeachersContextType {
    teachers: TeacherProvider[];
    allTeachers: TeacherProvider[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const SchoolTeachersContext = createContext<SchoolTeachersContextType | undefined>(undefined);

interface SchoolTeachersProviderProps {
    children: ReactNode;
}

export function SchoolTeachersProvider({ children }: SchoolTeachersProviderProps) {
    const [teachers, setTeachers] = useState<TeacherProvider[]>([]);
    const [allTeachers, setAllTeachers] = useState<TeacherProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getSchoolTeachersProviderAction();

            if (result.success && result.data) {
                // Store all teachers (including inactive)
                setAllTeachers(result.data);
                // Filter for active teachers only
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
