"use client";

import { ReactNode, useCallback, useRef } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { useAdminClassboardEventListener, useAdminClassboardBookingListener } from "@/supabase/subscribe";
import { getSQLClassboardDataForBooking } from "@/supabase/server/classboard";
import { useClassboardContext } from "@/src/providers/classboard-provider";

interface ClassboardRealtimeSyncProps {
    children: ReactNode;
}

/**
 * ClassboardRealtimeSync - Listens for real-time updates and syncs to GlobalFlag
 * Optimized to only update affected bookings instead of rebuilding everything
 */
export default function ClassboardRealtimeSync({ children }: ClassboardRealtimeSyncProps) {
    const { setClassboardModel, clearOptimisticEvents, optimisticEvents } = useClassboardContext();
    const renderCount = useRef(0);
    renderCount.current++;

    console.log(`🔄 [ClassboardRealtimeSync] Render #${renderCount.current}`);

    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        console.log(`🔔 [ClassboardRealtimeSync] Event detected -> Incremental update (${newData.length} bookings)`);

        // Incremental update: merge new data with existing data
        setClassboardModel((prevModel) => {
            const updatedModel = [...prevModel];

            // For each booking in newData, update or add it to the model
            newData.forEach((newBooking) => {
                const existingIndex = updatedModel.findIndex((b) => b.booking.id === newBooking.booking.id);

                if (existingIndex >= 0) {
                    // Replace existing booking with updated version
                    updatedModel[existingIndex] = newBooking;
                    console.log(`  ♻️ Updated booking: ${newBooking.booking.leaderStudentName}`);
                } else {
                    // Add new booking
                    updatedModel.push(newBooking);
                    console.log(`  ➕ Added new booking: ${newBooking.booking.leaderStudentName}`);
                }
            });

            return updatedModel;
        });

        // Clear optimistic events that now exist in the real data
        const allRealEventIds = new Set<string>();
        newData.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                (lesson.events || []).forEach((event) => {
                    allRealEventIds.add(event.id);
                });
            });
        });

        // Only clear optimistic events that have been confirmed
        clearOptimisticEvents();
        console.log(`  🧹 Cleared optimistic events (${optimisticEvents.size} pending)`);
    }, [setClassboardModel, clearOptimisticEvents, optimisticEvents]);

    const handleNewBookingDetected = useCallback(async (bookingId: string) => {
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
    }, [setClassboardModel]);

    useAdminClassboardEventListener({ onEventDetected: handleEventDetected });
    useAdminClassboardBookingListener({ onNewBooking: handleNewBookingDetected });

    return <>{children}</>;
}
