"use client";

import { useEffect, useRef } from "react";
import { getClientConnection as createClient } from "@/supabase/connection";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getSQLClassboardDataForBooking } from "@/supabase/server/classboard";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

interface AdminClassboardEventListenerOptions {
    onEventDetected: (data: ClassboardModel) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export function useAdminClassboardEventListener({ onEventDetected }: AdminClassboardEventListenerOptions) {
    const credentials = useSchoolCredentials();
    const schoolId = credentials?.id || "";
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!schoolId || schoolId.length === 0) {
            return;
        }

        const setupSubscription = () => {
            try {
                const supabase = createClient();

                const handleEventChange = (payload: any) => {
                    console.log("[EVENT-LISTENER] 📢 Event detected:", {
                        event: payload.eventType,
                        table: payload.table,
                        new: payload.new,
                        old: payload.old,
                    });

                    // Extract lessonId from the event payload
                    const lessonId = payload.new?.lesson_id || payload.old?.lesson_id;

                    if (!lessonId) {
                        console.warn("[EVENT-LISTENER] ⚠️ Could not extract lesson_id from event payload");
                        return;
                    }

                    // Resolve booking_id from lesson_id
                    const resolveBookingId = async () => {
                        const { data, error } = await supabase
                            .from("lesson")
                            .select("booking_id")
                            .eq("id", lessonId)
                            .single();
                        
                        if (error || !data) {
                            console.error("[EVENT-LISTENER] ❌ Failed to resolve booking_id from lesson:", error);
                            return null;
                        }
                        return data.booking_id;
                    };

                    resolveBookingId().then((bookingId) => {
                        if (!bookingId) return;

                        // Only fetch the affected booking instead of all bookings
                        getSQLClassboardDataForBooking(bookingId)
                            .then((result) => {
                                if ("success" in result && result.success && result.data && result.data.length > 0) {
                                    console.log("[EVENT-LISTENER] ✅ Refetch successful, updating UI");
                                    onEventDetected(result.data);
                                } else if ("error" in result) {
                                    console.error("[EVENT-LISTENER] ❌ Refetch failed:", result.error);
                                }
                            })
                            .catch((err) => {
                                console.error("[EVENT-LISTENER] ❌ Exception during refetch:", err);
                            });
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
                            event: "UPDATE",
                            schema: "public",
                            table: "event",
                            filter: `school_id=eq.${schoolId}`,
                        },
                        (payload) => {
                            console.log("[EVENT-LISTENER] ✏️ UPDATE event received", {
                                eventId: payload.new?.id,
                                oldDate: payload.old?.date,
                                newDate: payload.new?.date,
                                oldDuration: payload.old?.duration,
                                newDuration: payload.new?.duration,
                            });
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
                    .subscribe((status, err) => {
                        console.log(`[EVENT-LISTENER] Subscription status: ${status}`);
                        if (status === "SUBSCRIBED") {
                            console.log("✅ [EVENT-LISTENER] Successfully subscribed to event changes");
                            retryCountRef.current = 0;
                        } else if (status === "CHANNEL_ERROR") {
                            console.error(`❌ [EVENT-LISTENER] CHANNEL_ERROR occurred (Attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`, err);
                            handleSubscriptionError();
                        } else if (status === "TIMED_OUT") {
                            console.error(`❌ [EVENT-LISTENER] TIMED_OUT waiting for subscription (Attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`, err);
                            handleSubscriptionError();
                        }
                    });

                const handleSubscriptionError = () => {
                    supabase.removeChannel(eventChannel);

                    if (retryCountRef.current < MAX_RETRIES) {
                        retryCountRef.current += 1;
                        console.log(`[EVENT-LISTENER] Retrying in ${RETRY_DELAY_MS}ms...`);
                        retryTimeoutRef.current = setTimeout(() => {
                            setupSubscription();
                        }, RETRY_DELAY_MS);
                    } else {
                        console.error("[EVENT-LISTENER] ⚠️ Max retries reached. Real-time updates disabled. Classboard will still work with manual refreshes.");
                    }
                };

                // Cleanup
                return () => {
                    supabase.removeChannel(eventChannel);
                    if (retryTimeoutRef.current) {
                        clearTimeout(retryTimeoutRef.current);
                    }
                };
            } catch (error) {
                console.error("[EVENT-LISTENER] Error during setup:", error);
            }
        };

        return setupSubscription();
    }, [schoolId, onEventDetected]);
}
