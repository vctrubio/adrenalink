"use client";

import { createContext, useContext, ReactNode } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";

interface ClassboardContextType {
    data: ClassboardModel;
}

const ClassboardContext = createContext<ClassboardContextType | undefined>(undefined);

export function ClassboardProvider({ children, data }: { children: ReactNode; data: ClassboardModel }) {
    return (
        <ClassboardContext.Provider value={{ data }}>
            {children}
        </ClassboardContext.Provider>
    );
}

export function useClassboardData(): ClassboardModel {
    const context = useContext(ClassboardContext);
    if (!context) {
        throw new Error("useClassboardData must be used within ClassboardProvider");
    }
    return context.data;
}
