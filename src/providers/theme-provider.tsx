"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/src/components/ui/toaster";
import { TeacherSortOrderProvider } from "./teacher-sort-order-provider";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TeacherSortOrderProvider>
                {children}
            </TeacherSortOrderProvider>
            <Toaster />
        </ThemeProvider>
    );
}
