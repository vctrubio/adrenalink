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

    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        console.log("🔔 [SUBSCRIPTION] Event detected, updating classboard");
        setClassboardModel(newData);
    }, [setClassboardModel]);

    const handleNewBookingDetected = useCallback(async () => {
        console.log("🔔 [SUBSCRIPTION] New booking detected");
        const result = await getClassboardBookings();
        if (result.success) setClassboardModel(result.data);
    }, [setClassboardModel]);

    useAdminClassboardEventListener({ onEventDetected: handleEventDetected });
    useAdminClassboardBookingListener({ onNewBooking: handleNewBookingDetected });

    return <>{children}</>;
}
