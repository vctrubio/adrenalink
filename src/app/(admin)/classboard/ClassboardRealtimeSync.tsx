"use client";

import { ReactNode, useCallback, useRef, useEffect } from "react";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getSQLClassboardDataForBooking } from "@/supabase/server/classboard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import toast from "react-hot-toast";

interface ClassboardRealtimeSyncProps {
    children: ReactNode;
}

/**
 * ClassboardRealtimeSync - Listens for real-time updates and syncs to GlobalFlag
 * Optimized to only update affected bookings instead of rebuilding everything
 */
export default function ClassboardRealtimeSync({ children }: ClassboardRealtimeSyncProps) {
    const { setClassboardModel, classboardModel } = useClassboardContext();
    const modelRef = useRef(classboardModel);
    modelRef.current = classboardModel; // Keep ref updated

    // Monitor connectivity status
    useEffect(() => {
        const handleOffline = () => {
            console.log("🔌 [ClassboardRealtimeSync] Connection lost");
            toast.error("Connection lost. Realtime sync paused.", {
                id: "connection-status",
                duration: 5000,
            });
        };

        const handleOnline = () => {
            console.log("🔌 [ClassboardRealtimeSync] Back online");
            toast.success("Back online. Resuming sync.", {
                id: "connection-status",
                duration: 3000,
            });
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    const handleEventDetected = useCallback(
        (newData: ClassboardModel) => {
            console.log(`🔔 [ClassboardRealtimeSync] Event detected -> Incremental update (${newData.length} bookings)`);

            // 1. Calculate the new model state based on current ref
            const prevModel = modelRef.current;
            const updatedModel = [...prevModel];

            newData.forEach((newBooking) => {
                const existingIndex = updatedModel.findIndex((b) => b.booking.id === newBooking.booking.id);
                if (existingIndex >= 0) {
                    updatedModel[existingIndex] = newBooking;
                } else {
                    updatedModel.push(newBooking);
                }
            });

            // 2. Update the model state
            setClassboardModel(updatedModel);
        },
        [setClassboardModel],
    );

    const handleNewBookingDetected = useCallback(
        async (bookingId: string) => {
            console.log(`🔔 [ClassboardRealtimeSync] New booking detected: ${bookingId}`);
            const result = await getSQLClassboardDataForBooking(bookingId);
            if ("success" in result && result.success && result.data) {
                // Merge the new booking into existing classboard model instead of replacing everything
                setClassboardModel((prev) => {
                    // Remove if it already exists (in case of duplicate), then add it
                    const filtered = prev.filter((b) => b.booking.id !== bookingId);
                    console.log(`  📥 Adding ${result.data.length} booking(s) to model`);
                    return [...filtered, ...result.data];
                });
            }
        },
        [setClassboardModel],
    );

    const getBookingIdForEvent = useCallback((eventId: string) => {
        // Search current model for this event ID
        for (const bookingData of modelRef.current) {
            for (const lesson of bookingData.lessons) {
                if (lesson.events?.some((e) => e.id === eventId)) {
                    return bookingData.booking.id;
                }
            }
        }
        return undefined;
    }, []);

    useAdminClassboardEventListener({
        onEventDetected: handleEventDetected,
        getBookingIdForEvent,
    });
    useAdminClassboardBookingListener({ onNewBooking: handleNewBookingDetected });

    return <>{children}</>;
}
