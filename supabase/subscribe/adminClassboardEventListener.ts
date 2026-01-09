"use client";

import { useEffect, useRef } from "react";
import { getClientConnection as createClient } from "@/supabase/connection";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { getSQLClassboardDataForBooking } from "@/supabase/server/classboard";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

interface AdminClassboardEventListenerOptions {
    onEventDetected: (data: ClassboardModel) => void;
    getBookingIdForEvent?: (eventId: string) => string | undefined;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export function useAdminClassboardEventListener({ onEventDetected, getBookingIdForEvent }: AdminClassboardEventListenerOptions) {
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

                const handleTableChange = (payload: any) => {
                    console.log("[EVENT-LISTENER] 📢 Table change detected:", {
                        event: payload.eventType,
                        table: payload.table,
                        new: payload.new,
                        old: payload.old,
                    });

                    // 1. Direct Case: Lesson table has booking_id directly
                    if (payload.table === "lesson") {
                        const bookingId = payload.new?.booking_id || payload.old?.booking_id;
                        if (bookingId) {
                            console.log(`[EVENT-LISTENER] ✅ Lesson changed, refetching booking: ${bookingId}`);
                            fetchAndNotify(bookingId);
                            return;
                        }
                    }

                    // 2. Event Case: Needs to resolve booking_id via lesson_id or local cache
                    const lessonId = payload.new?.lesson_id || payload.old?.lesson_id;
                    const eventId = payload.new?.id || payload.old?.id;

                    if (!lessonId) {
                        // Fallback: Try to find booking_id from local cache if provided
                        if (eventId && getBookingIdForEvent) {
                            const cachedBookingId = getBookingIdForEvent(eventId);
                            if (cachedBookingId) {
                                console.log(`[EVENT-LISTENER] ✅ Resolved booking_id ${cachedBookingId} from local cache for event ${eventId}`);
                                fetchAndNotify(cachedBookingId);
                                return;
                            }
                        }
                        
                        console.warn("[EVENT-LISTENER] ⚠️ Could not extract lesson_id from event payload and local lookup failed");
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
                        if (bookingId) fetchAndNotify(bookingId);
                    });
                };

                const fetchAndNotify = (bookingId: string) => {
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
                };

                const eventChannel = supabase
                    .channel(`classboard_booking_activity_${schoolId}`)
                    // --- EVENT Table ---
                    .on(
                        "postgres_changes",
                        {
                            event: "INSERT",
                            schema: "public",
                            table: "event",
                            filter: `school_id=eq.${schoolId}`,
                        },
                        (payload) => {
                            console.log("[EVENT-LISTENER] 📥 EVENT Insert");
                            handleTableChange(payload);
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
                            console.log("[EVENT-LISTENER] ✏️ EVENT Update");
                            handleTableChange(payload);
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
                            console.log("[EVENT-LISTENER] 🗑️ EVENT Delete");
                            handleTableChange(payload);
                        },
                    )
                    // --- LESSON Table ---
                    .on(
                        "postgres_changes",
                        {
                            event: "INSERT",
                            schema: "public",
                            table: "lesson",
                            filter: `school_id=eq.${schoolId}`,
                        },
                        (payload) => {
                            console.log("[EVENT-LISTENER] 📚 LESSON Insert");
                            handleTableChange(payload);
                        },
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "UPDATE",
                            schema: "public",
                            table: "lesson",
                            filter: `school_id=eq.${schoolId}`,
                        },
                        (payload) => {
                            console.log("[EVENT-LISTENER] 📚 LESSON Update");
                            handleTableChange(payload);
                        },
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "DELETE",
                            schema: "public",
                            table: "lesson",
                        },
                        (payload) => {
                            console.log("[EVENT-LISTENER] 📚 LESSON Delete");
                            handleTableChange(payload);
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
    }, [schoolId, onEventDetected, getBookingIdForEvent]);
}
