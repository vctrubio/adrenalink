"use client";

import { useContext, useMemo } from "react";
import { SchoolTeachersContext } from "@/src/providers/school-teachers-provider";
import { useTeacherSortOrder } from "./useTeacherSortOrder";

export function useSchoolTeachers() {
    const context = useContext(SchoolTeachersContext);
    const teacherSortOrder = useTeacherSortOrder();

    if (!context) {
        throw new Error("useSchoolTeachers hook requires <SchoolTeachersProvider> parent");
    }

    // Sort teachers by saved order
    const sortedTeachers = useMemo(() => {
        if (!teacherSortOrder || teacherSortOrder.length === 0) {
            return context.teachers;
        }

        return [...context.teachers].sort((a, b) => {
            const aIndex = teacherSortOrder.indexOf(a.schema.id);
            const bIndex = teacherSortOrder.indexOf(b.schema.id);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [context.teachers, teacherSortOrder]);

    const sortedAllTeachers = useMemo(() => {
        if (!teacherSortOrder || teacherSortOrder.length === 0) {
            return context.allTeachers;
        }

        return [...context.allTeachers].sort((a, b) => {
            const aIndex = teacherSortOrder.indexOf(a.schema.id);
            const bIndex = teacherSortOrder.indexOf(b.schema.id);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [context.allTeachers, teacherSortOrder]);

    return {
        teachers: sortedTeachers,
        allTeachers: sortedAllTeachers,
        loading: context.loading,
        error: context.error,
        refetch: context.refetch,
        setTeacherActive: context.setTeacherActive,
    };
}
