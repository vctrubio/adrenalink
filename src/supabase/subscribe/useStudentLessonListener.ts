"use client";

import { useEffect } from "react";
import { createClient } from "@/supabase/client";
import { getStudentPackageBookingLessons, type StudentPackageBookingLessons } from "@/src/actions/user-action";
import type { ApiActionResponseModel } from "@/types/actions";

interface UseStudentLessonListenerOptions {
    studentId: string;
    schoolId: string;
    onEventDetected: (data: ApiActionResponseModel<StudentPackageBookingLessons>) => void;
}

export function useStudentLessonListener({ studentId, schoolId, onEventDetected }: UseStudentLessonListenerOptions) {
    useEffect(() => {
        if (!studentId || !schoolId) {
            return;
        }

        try {
            const supabase = createClient();

            const handleEventChange = () => {
                getStudentPackageBookingLessons(studentId)
                    .then((result) => {
                        onEventDetected(result);
                    })
                    .catch((err) => {
                        console.error("[STUDENT-LESSON-LISTENER] Exception during refetch:", err);
                    });
            };

            const eventChannel = supabase
                .channel(`student_lesson_changes_${studentId}`)
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
                        console.log("✅ [STUDENT-LESSON-LISTENER] SUBSCRIBED");
                    } else if (status === "CHANNEL_ERROR") {
                        console.error("[STUDENT-LESSON-LISTENER] CHANNEL_ERROR occurred");
                    } else if (status === "TIMED_OUT") {
                        console.error("[STUDENT-LESSON-LISTENER] TIMED_OUT waiting for subscription");
                    }
                });

            // Cleanup
            return () => {
                supabase.removeChannel(eventChannel);
            };
        } catch (error) {
            console.error("[STUDENT-LESSON-LISTENER] Error during setup:", error);
        }
    }, [studentId, schoolId]);
}
