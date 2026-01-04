"use client";

import { ReactNode, useCallback, useRef, useEffect } from "react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
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
    const { setClassboardModel, optimisticOperations, setOptimisticOperations, classboardModel } = useClassboardContext();
    const renderCount = useRef(0);
    const modelRef = useRef(classboardModel);
    modelRef.current = classboardModel; // Keep ref updated

    renderCount.current++;

    console.log(`🔄 [ClassboardRealtimeSync] Render #${renderCount.current}`);

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

    const handleEventDetected = useCallback((newData: ClassboardModel) => {
        console.log(`🔔 [ClassboardRealtimeSync] Event detected -> Incremental update (${newData.length} bookings)`);

        // Identify which lessons now have real events
        const lessonsWithRealEvents = new Set<string>();
        newData.forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                if ((lesson.events || []).length > 0) {
                    lessonsWithRealEvents.add(lesson.id);
                }
            });
        });

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

        // 3. Clean up optimistic operations (both add and delete)
        setOptimisticOperations((prev) => {
            if (prev.size === 0) return prev;
            
            const updated = new Map(prev);
            let clearedCount = 0;

            // Check for additions cleanup
            updated.forEach((op, key) => {
                if (op.type === "add") {
                    if (lessonsWithRealEvents.has(op.event.lessonId)) {
                        updated.delete(key);
                        clearedCount++;
                    }
                }
            });

            // Check for deletions cleanup
            // Collect all current event IDs from the updated model
            const allEventIds = new Set<string>();
            updatedModel.forEach(b => b.lessons.forEach(l => (l.events || []).forEach(e => allEventIds.add(e.id))));

            updated.forEach((op, key) => {
                if (op.type === "delete") {
                    // If the event ID is NOT in the updated model, the deletion is confirmed
                    if (!allEventIds.has(op.eventId)) {
                        updated.delete(key);
                        clearedCount++;
                    }
                }
            });

            if (clearedCount > 0) {
                console.log(`  🧹 Cleared ${clearedCount} optimistic operation(s)`);
            }
            
            return updated.size !== prev.size ? updated : prev;
        });

    }, [setClassboardModel, setOptimisticOperations]);

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
