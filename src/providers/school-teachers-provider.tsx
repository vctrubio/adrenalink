"use client";

import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { getSchoolTeacherProvider } from "@/supabase/server/teachers";
import type { TeacherProvider } from "@/supabase/server/teachers";

interface SchoolTeachersContextType {
    teachers: TeacherProvider[];
    allTeachers: TeacherProvider[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    setTeacherActive: (teacherId: string, active: boolean) => void;
}

export const SchoolTeachersContext = createContext<SchoolTeachersContextType | undefined>(undefined);

interface SchoolTeachersProviderProps {
    children: ReactNode;
    initialData?: {
        teachers: TeacherProvider[];
        allTeachers: TeacherProvider[];
    } | null;
}

export function SchoolTeachersProvider({ children, initialData }: SchoolTeachersProviderProps) {
    const [teachers, setTeachers] = useState<TeacherProvider[]>(initialData?.teachers || []);
    const [allTeachers, setAllTeachers] = useState<TeacherProvider[]>(initialData?.allTeachers || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    const setTeacherActive = (teacherId: string, active: boolean) => {
        setAllTeachers((prev) => 
            prev.map(t => t.schema.id === teacherId ? { ...t, schema: { ...t.schema, active } } : t)
        );
        
        setTeachers((prev) => {
            // If turning on, we might need to find it in allTeachers
            if (active) {
                const alreadyActive = prev.some(t => t.schema.id === teacherId);
                if (alreadyActive) return prev;
                
                const teacher = allTeachers.find(t => t.schema.id === teacherId);
                if (teacher) return [...prev, { ...teacher, schema: { ...teacher.schema, active: true } }];
                return prev;
            } 
            // If turning off, just filter it out
            return prev.filter(t => t.schema.id !== teacherId);
        });
    };

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getSchoolTeacherProvider();

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
        if (!initialData) {
            fetchTeachers();
        }
    }, [initialData]);

    const contextValue = useMemo(
        () => ({
            teachers,
            allTeachers,
            loading,
            error,
            refetch: fetchTeachers,
            setTeacherActive,
        }),
        [teachers, allTeachers, loading, error],
    );

    return <SchoolTeachersContext.Provider value={contextValue}>{children}</SchoolTeachersContext.Provider>;
}
