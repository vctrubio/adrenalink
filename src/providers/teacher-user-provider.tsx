"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getClientConnection } from "@/supabase/connection";
import type { TeacherUserData } from "@/supabase/server/teacher-user";

interface TeacherUserContextValue {
    data: TeacherUserData;
    schoolId: string;
    currency: string;
    timezone?: string;
}

const TeacherUserContext = createContext<TeacherUserContextValue | null>(null);

interface TeacherUserProviderProps {
    children: ReactNode;
    data: TeacherUserData;
    schoolId: string;
    currency: string;
    timezone?: string;
}

/**
 * TeacherUserProvider - Single source of truth for teacher user data
 *
 * Provides comprehensive teacher data to all teacher routes:
 * - Teacher profile
 * - Commissions
 * - Equipment
 * - Lessons with full booking, student, event, payment data
 *
 * Features:
 * - Real-time subscription for event/lesson updates
 * - Auto-refresh on data changes
 * - DRY architecture - fetch once, use everywhere
 */
export function TeacherUserProvider({
    children,
    data,
    schoolId,
    currency,
    timezone,
}: TeacherUserProviderProps) {
    const router = useRouter();

    // Set up real-time subscription for event and lesson updates
    useEffect(() => {
        if (!schoolId) return;

        const supabase = getClientConnection();

        // Subscribe to event changes (status updates, equipment assignments)
        const eventChannel = supabase
            .channel(`teacher_user_events_${data.teacher.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "event",
                    filter: `school_id=eq.${schoolId}`,
                },
                (payload) => {
                    console.log("[TeacherUserProvider] Event change detected:", payload);
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[TeacherUserProvider] Event subscription status: ${status}`);
            });

        // Subscribe to lesson changes
        const lessonChannel = supabase
            .channel(`teacher_user_lessons_${data.teacher.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "lesson",
                },
                (payload) => {
                    console.log("[TeacherUserProvider] Lesson change detected:", payload);
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[TeacherUserProvider] Lesson subscription status: ${status}`);
            });

        // Subscribe to equipment_event changes (equipment assignments)
        const equipmentEventChannel = supabase
            .channel(`teacher_user_equipment_event_${data.teacher.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "equipment_event",
                },
                (payload) => {
                    console.log("[TeacherUserProvider] Equipment event change detected:", payload);
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[TeacherUserProvider] Equipment event subscription status: ${status}`);
            });

        // Subscribe to teacher_lesson_payment changes
        const paymentChannel = supabase
            .channel(`teacher_user_payments_${data.teacher.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "teacher_lesson_payment",
                },
                (payload) => {
                    console.log("[TeacherUserProvider] Payment change detected:", payload);
                    router.refresh();
                },
            )
            .subscribe((status) => {
                console.log(`[TeacherUserProvider] Payment subscription status: ${status}`);
            });

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(eventChannel);
            supabase.removeChannel(lessonChannel);
            supabase.removeChannel(equipmentEventChannel);
            supabase.removeChannel(paymentChannel);
        };
    }, [schoolId, data.teacher.id, router]);

    const value: TeacherUserContextValue = {
        data,
        schoolId,
        currency,
        timezone,
    };

    return <TeacherUserContext.Provider value={value}>{children}</TeacherUserContext.Provider>;
}

/**
 * Hook to access teacher user data from context
 * Must be used within TeacherUserProvider
 */
export function useTeacherUser(): TeacherUserContextValue {
    const context = useContext(TeacherUserContext);
    if (!context) {
        throw new Error("useTeacherUser must be used within TeacherUserProvider");
    }
    return context;
}
