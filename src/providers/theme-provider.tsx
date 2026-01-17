"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/src/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
                <Toaster />
            </ThemeProvider>
        </ClerkProvider>
    );
}
