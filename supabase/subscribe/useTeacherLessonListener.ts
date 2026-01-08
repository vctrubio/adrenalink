"use client";

import { useEffect } from "react";
import { getClientConnection as createClient } from "@/supabase/connection";
import { getTeacherPackageBookingLessons, type TeacherPackageBookingLessons } from "@/supabase/server/user";
import type { ApiActionResponseModel } from "@/types/actions";

interface UseTeacherLessonListenerOptions {
    teacherId: string;
    schoolId: string;
    onEventDetected: (data: ApiActionResponseModel<TeacherPackageBookingLessons>) => void;
}

export function useTeacherLessonListener({ teacherId, schoolId, onEventDetected }: UseTeacherLessonListenerOptions) {
    useEffect(() => {
        if (!teacherId || !schoolId) {
            return;
        }

        try {
            const supabase = createClient();

            const handleEventChange = () => {
                getTeacherPackageBookingLessons(teacherId)
                    .then((result) => {
                        onEventDetected(result);
                    })
                    .catch((err) => {
                        console.error("[TEACHER-LESSON-LISTENER] Exception during refetch:", err);
                    });
            };

            const eventChannel = supabase
                .channel(`teacher_lesson_changes_${teacherId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "event",
                        filter: `school_id=eq.${schoolId}`,
                    },
                    handleEventChange,
                )
                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "event",
                        filter: `school_id=eq.${schoolId}`,
                    },
                    handleEventChange,
                )
                .subscribe((status) => {
                    if (status === "SUBSCRIBED") {
                        console.log("✅ [TEACHER-LESSON-LISTENER] SUBSCRIBED");
                    } else if (status === "CHANNEL_ERROR") {
                        console.error("[TEACHER-LESSON-LISTENER] CHANNEL_ERROR occurred");
                    } else if (status === "TIMED_OUT") {
                        console.error("[TEACHER-LESSON-LISTENER] TIMED_OUT waiting for subscription");
                    }
                });

            // Cleanup
            return () => {
                supabase.removeChannel(eventChannel);
            };
        } catch (error) {
            console.error("[TEACHER-LESSON-LISTENER] Error during setup:", error);
        }
    }, [teacherId, schoolId]);
}
