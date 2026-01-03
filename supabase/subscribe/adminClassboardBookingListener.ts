"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/supabase/client";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";

interface AdminClassboardBookingListenerOptions {
    onNewBooking: (bookingId: string) => void;
}

export function useAdminClassboardBookingListener({ onNewBooking }: AdminClassboardBookingListenerOptions) {
    const credentials = useSchoolCredentials();
    const schoolId = credentials?.id || "";
    // Store the callback in a ref so we don't recreate subscriptions on every render
    const callbackRef = useRef(onNewBooking);
    const isSubscribedRef = useRef(false);

    useEffect(() => {
        callbackRef.current = onNewBooking;
    }, [onNewBooking]);

    useEffect(() => {
        if (!schoolId) {
            return;
        }

        const supabase = createClient();
        isSubscribedRef.current = false;

        // Subscribe to Booking table changes filtered by school_id
        const bookingChannel = supabase
            .channel(`classboard_booking_changes_${schoolId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "booking",
                    filter: `school_id=eq.${schoolId}`,
                },
                async (payload) => {
                    // Only process if subscription is established
                    if (!isSubscribedRef.current) {
                        console.warn("🚨 [BOOKING-LISTENER] Event received before subscription ready, ignoring");
                        return;
                    }

                    try {
                        const bookingId = payload.new?.id;
                        console.log("🎫 [BOOKING-LISTENER] New booking detected:", bookingId);
                        await callbackRef.current(bookingId);
                    } catch (error) {
                        console.error("❌ [BOOKING-LISTENER] Error calling onNewBooking:", error);
                    }
                },
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    isSubscribedRef.current = true;
                    console.log("✅ [BOOKING-LISTENER] SUBSCRIBED and ready to receive events");
                    // Don't refetch on subscribe - layout already has initial data
                    // Only refetch when a new booking is actually created
                } else if (status === "CHANNEL_ERROR") {
                    isSubscribedRef.current = false;
                    console.error("❌ [BOOKING-LISTENER] Channel error");
                } else if (status === "CLOSED") {
                    isSubscribedRef.current = false;
                    console.log("ℹ️  [BOOKING-LISTENER] Channel closed");
                }
            });

        // Cleanup
        return () => {
            isSubscribedRef.current = false;
            supabase.removeChannel(bookingChannel);
        };
    }, [schoolId]);
}
