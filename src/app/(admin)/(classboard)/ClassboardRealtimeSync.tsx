"use client";

import { ReactNode, useCallback } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getSQLClassboardDataForBooking } from "@/supabase/server/classboard";
import { useClassboardContext } from "@/src/providers/classboard-provider";

interface ClassboardRealtimeSyncProps {
    children: ReactNode;
}

export default function ClassboardRealtimeSync({ children }: ClassboardRealtimeSyncProps) {
    const { setClassboardModel, clearOptimisticEvents } = useClassboardContext();

    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        console.log("🔔 [SUBSCRIPTION] Event detected, updating classboard");
        setClassboardModel(newData);
        clearOptimisticEvents();
    }, [setClassboardModel, clearOptimisticEvents]);

    const handleNewBookingDetected = useCallback(async (bookingId: string) => {
        console.log("🔔 [SUBSCRIPTION] New booking detected:", bookingId);
        const result = await getSQLClassboardDataForBooking(bookingId);
        if ("success" in result && result.success && result.data) {
            // Merge the new booking into existing classboard model instead of replacing everything
            setClassboardModel((prev) => {
                // Remove if it already exists (in case of duplicate), then add it
                const filtered = prev.filter((b) => b.booking.id !== bookingId);
                return [...filtered, ...result.data];
            });
        }
    }, [setClassboardModel]);

    useAdminClassboardEventListener({ onEventDetected: handleEventDetected });
    useAdminClassboardBookingListener({ onNewBooking: handleNewBookingDetected });

    return <>{children}</>;
}
