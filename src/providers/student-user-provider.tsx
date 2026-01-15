"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getClientConnection } from "@/supabase/connection";
import type { StudentUserData } from "@/supabase/server/student-user";

interface StudentUserContextValue {
    data: StudentUserData;
    schoolId: string;
    currency: string;
    timezone?: string;
}

const StudentUserContext = createContext<StudentUserContextValue | null>(null);

interface StudentUserProviderProps {
    children: ReactNode;
    data: StudentUserData;
    schoolId: string;
    currency: string;
    timezone?: string;
}

/**
 * StudentUserProvider - Single source of truth for student user data
 *
 * Provides comprehensive student data to all student routes:
 * - Student profile
 * - Bookings with progress
 * - Events
 *
 * Features:
 * - Real-time subscription for event updates
 * - Auto-refresh on data changes
 * - DRY architecture - fetch once, use everywhere
 */
export function StudentUserProvider({
    children,
    data,
    schoolId,
    currency,
    timezone,
}: StudentUserProviderProps) {
    const router = useRouter();

    // Set up real-time subscription for event updates
    useEffect(() => {
        if (!schoolId) return;

        const supabase = getClientConnection();

        // Subscribe to event changes (student's events)
        const eventChannel = supabase
            .channel(`student_user_events_${data.student.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "event",
                    filter: `school_id=eq.${schoolId}`,
                },
                (payload) => {
                    console.log("[StudentUserProvider] Event change detected:", payload);
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[StudentUserProvider] Event subscription status: ${status}`);
            });

        // Subscribe to booking changes
        const bookingChannel = supabase
            .channel(`student_user_bookings_${data.student.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "booking",
                },
                (payload) => {
                    console.log("[StudentUserProvider] Booking change detected:", payload);
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[StudentUserProvider] Booking subscription status: ${status}`);
            });

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(eventChannel);
            supabase.removeChannel(bookingChannel);
        };
    }, [schoolId, data.student.id, router]);

    const value: StudentUserContextValue = {
        data,
        schoolId,
        currency,
        timezone,
    };

    return <StudentUserContext.Provider value={value}>{children}</StudentUserContext.Provider>;
}

/**
 * Hook to access student user data from context
 * Must be used within StudentUserProvider
 */
export function useStudentUser(): StudentUserContextValue {
    const context = useContext(StudentUserContext);
    if (!context) {
        throw new Error("useStudentUser must be used within StudentUserProvider");
    }
    return context;
}
