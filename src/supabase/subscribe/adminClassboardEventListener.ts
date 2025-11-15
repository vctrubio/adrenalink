"use client";

import { useEffect } from "react";
import { createClient } from "@/supabase/client";
import { getClassboardBookings } from "@/actions/classboard-action";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";

interface AdminClassboardEventListenerOptions {
    schoolId: string;
    onEventDetected: (data: ClassboardModel) => void;
}

export function useAdminClassboardEventListener({ schoolId, onEventDetected }: AdminClassboardEventListenerOptions) {
    useEffect(() => {
        if (!schoolId || schoolId.length === 0) {
            return;
        }

        try {
            const supabase = createClient();

            const handleEventChange = (payload: any) => {
                console.log("[EVENT-LISTENER] 📢 Event detected:", {
                    event: payload.eventType,
                    table: payload.table,
                    new: payload.new,
                    old: payload.old,
                });

                getClassboardBookings()
                    .then((result) => {
                        if (result.success && result.data) {
                            console.log("[EVENT-LISTENER] ✅ Refetch successful, updating UI");
                            onEventDetected(result.data);
                        } else {
                            console.error("[EVENT-LISTENER] ❌ Refetch failed:", result.error);
                        }
                    })
                    .catch((err) => {
                        console.error("[EVENT-LISTENER] ❌ Exception during refetch:", err);
                    });
            };

            const eventChannel = supabase
                .channel(`classboard_event_changes_only_${schoolId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "event",
                        filter: `school_id=eq.${schoolId}`,
                    },
                    (payload) => {
                        console.log("[EVENT-LISTENER] 📥 INSERT event received");
                        handleEventChange(payload);
                    },
                )
                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "event",
                    },
                    (payload) => {
                        console.log("[EVENT-LISTENER] 🗑️ DELETE event received", payload);
                        handleEventChange(payload);
                    },
                )
                .subscribe((status) => {
                    console.log(`[EVENT-LISTENER] Subscription status: ${status}`);
                    if (status === "SUBSCRIBED") {
                        console.log("✅ [EVENT-LISTENER] Successfully subscribed to event changes");
                    } else if (status === "CHANNEL_ERROR") {
                        console.error("❌ [EVENT-LISTENER] CHANNEL_ERROR occurred");
                    } else if (status === "TIMED_OUT") {
                        console.error("❌ [EVENT-LISTENER] TIMED_OUT waiting for subscription");
                    }
                });

            // Cleanup
            return () => {
                supabase.removeChannel(eventChannel);
            };
        } catch (error) {
            console.error("[EVENT-LISTENER] Error during setup:", error);
        }
    }, [schoolId]);
}
