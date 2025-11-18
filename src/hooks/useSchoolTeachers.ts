"use client";

import { useContext } from "react";
import { SchoolTeachersContext } from "@/src/providers/school-teachers-provider";

export function useSchoolTeachers() {
    const context = useContext(SchoolTeachersContext);

    if (!context) {
        throw new Error("useSchoolTeachers must be used within SchoolTeachersProvider");
    }

    return context;
}
