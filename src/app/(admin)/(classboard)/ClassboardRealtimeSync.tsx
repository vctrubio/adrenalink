"use client";

import { ReactNode, useCallback } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getClassboardBookings } from "@/actions/classboard-action";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { useClassboardActions } from "@/src/providers/classboard-actions-provider";

interface ClassboardRealtimeSyncProps {
    children: ReactNode;
}

export default function ClassboardRealtimeSync({ children }: ClassboardRealtimeSyncProps) {
    const { setClassboardModel } = useClassboardContext();
    const { clearOptimisticEvents } = useClassboardActions();

    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        console.log("🔔 [SUBSCRIPTION] Event detected, updating classboard");
        setClassboardModel(newData);
        // Clear optimistic events atomically when real events arrive
        clearOptimisticEvents();
    }, [setClassboardModel, clearOptimisticEvents]);

    const handleNewBookingDetected = useCallback(async () => {
        console.log("🔔 [SUBSCRIPTION] New booking detected");
        const result = await getClassboardBookings();
        if (result.success) {
            setClassboardModel(result.data);
            // Clear optimistic events atomically when bookings change
            clearOptimisticEvents();
        }
    }, [setClassboardModel, clearOptimisticEvents]);

    useAdminClassboardEventListener({ onEventDetected: handleEventDetected });
    useAdminClassboardBookingListener({ onNewBooking: handleNewBookingDetected });

    return <>{children}</>;
}
