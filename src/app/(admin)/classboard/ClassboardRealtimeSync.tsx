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
    const { setClassboardModel, classboardModel, globalFlag } = useClassboardContext();
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

            // Collect event IDs from new data
            const updatedEventIds: string[] = [];
            const newEventIdSet = new Set<string>();

            newData.forEach((booking) => {
                booking.lessons.forEach((lesson) => {
                    lesson.events?.forEach((event) => {
                        updatedEventIds.push(event.id);
                        newEventIdSet.add(event.id);
                        console.log(
                            `  📝 Event update detected: ${event.id} | Teacher: ${lesson.teacher?.username} | Status: ${event.status} | Time: ${event.date}`,
                        );
                    });
                });
            });

            // Detect deleted events (events in old model but not in new model)
            const deletedEventIds: string[] = [];
            const prevModel = modelRef.current;
            prevModel.forEach((booking) => {
                booking.lessons.forEach((lesson) => {
                    lesson.events?.forEach((event) => {
                        if (!newEventIdSet.has(event.id)) {
                            deletedEventIds.push(event.id);
                            console.log(`  🗑️ Event deleted: ${event.id}`);
                        }
                    });
                });
            });

            // 1. Calculate the new model state based on current ref
            const updatedModel = [...prevModel];

            newData.forEach((newBooking) => {
                const existingIndex = updatedModel.findIndex((b) => b.booking.id === newBooking.booking.id);
                if (existingIndex >= 0) {
                    console.log(`  🔄 Updating booking ${newBooking.booking.id} at index ${existingIndex}`);
                    updatedModel[existingIndex] = newBooking;
                } else {
                    console.log(`  ➕ Adding new booking ${newBooking.booking.id}`);
                    updatedModel.push(newBooking);
                }
            });

            console.log(`🔔 [ClassboardRealtimeSync] Applying model update (prev: ${prevModel.length}, new: ${updatedModel.length})`);

            // 2. Update the model state
            setClassboardModel(updatedModel);

            // 3. Clear mutations only for events that actually changed
            // Compare old and new events to detect actual updates
            const changedEventIds: string[] = [];

            newData.forEach((newBooking) => {
                newBooking.lessons.forEach((newLesson) => {
                    newLesson.events?.forEach((newEvent) => {
                        // Find the same event in old model to compare
                        const oldBooking = prevModel.find((b) => b.booking.id === newBooking.booking.id);
                        if (oldBooking) {
                            const oldLesson = oldBooking.lessons.find((l) => l.id === newLesson.id);
                            if (oldLesson) {
                                const oldEvent = oldLesson.events?.find((e) => e.id === newEvent.id);
                                if (oldEvent) {
                                    // Check if time changed
                                    if (oldEvent.date !== newEvent.date) {
                                        changedEventIds.push(newEvent.id);
                                        console.log(
                                            `  🔄 [Realtime] Event time changed: ${newEvent.id} from ${oldEvent.date} to ${newEvent.date}`,
                                        );
                                    }
                                    // Check if status changed
                                    if (oldEvent.status !== newEvent.status) {
                                        changedEventIds.push(newEvent.id);
                                        console.log(
                                            `  🔄 [Realtime] Event status changed: ${newEvent.id} from ${oldEvent.status} to ${newEvent.status}`,
                                        );
                                    }
                                }
                            }
                        }
                    });
                });
            });

            // Clear mutations for events that actually changed
            // Use Set to avoid duplicates if both time and status changed
            const uniqueChangedIds = Array.from(new Set(changedEventIds));
            uniqueChangedIds.forEach((eventId) => {
                globalFlag.clearEventMutation(eventId);
                console.log(`  ✅ Cleared updating status for ${eventId} (confirmed by realtime sync)`);
            });

            // Deleted events: Their mutation stays active since they're removed from model
            deletedEventIds.forEach((eventId) => {
                console.log(`  ✅ Event ${eventId} removed from model (will disappear with spinner)`);
            });
        },
        [setClassboardModel, globalFlag],
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

    const handleEventUpdate = useCallback(
        (payload: {
            eventType: "INSERT" | "UPDATE" | "DELETE";
            eventId: string;
            lessonId: string;
            date?: string;
            duration?: number;
            location?: string;
            status?: string;
        }) => {
            console.log(`🔔 [ClassboardRealtimeSync] Event ${payload.eventType} - Zero-fetch update`);

            const { eventType, eventId, lessonId, date, duration, location, status } = payload;

            // Pass date directly (Wall Clock Time)
            const convertedDate = date;
            if (date) {
               console.log(`  🕐 [Realtime] Date received: ${date}`);
            }

            // Find the teacher ID from lessonId (will be used for selective sync optimization)
            const prevModel = modelRef.current;
            let affectedTeacherId: string | undefined;

            for (const bookingData of prevModel) {
                for (const lesson of bookingData.lessons) {
                    if (lesson.id === lessonId) {
                        affectedTeacherId = lesson.teacher?.id;
                        if (affectedTeacherId) {
                            console.log(`  👨‍🏫 Found affected teacher: ${lesson.teacher?.username} (${affectedTeacherId})`);
                            // Mark this teacher as affected so SyncEngine only syncs them
                            globalFlag.markTeacherAffected(affectedTeacherId);
                        }
                        break;
                    }
                }
                if (affectedTeacherId) break;
            }

            // Handle INSERT: look up pending creation and clear its mutation
            if (eventType === "INSERT") {
                console.log(`[ClassboardRealtimeSync] INSERT event ${eventId}, looking up pending creation`);

                // Search for pending creation for this lesson
                let found = false;
                for (const bookingData of prevModel) {
                    if (found) break;
                    for (const lesson of bookingData.lessons) {
                        if (lesson.id === lessonId) {
                            const tempId = globalFlag.getPendingTempId(bookingData.booking.id, lessonId);
                            if (tempId) {
                                console.log(`[ClassboardRealtimeSync] Found pending temp event ${tempId}, clearing mutation`);
                                // Clear mutation for the temp ID - stops the spinner immediately!
                                globalFlag.clearEventMutation(tempId);
                                globalFlag.removePendingEventCreation(bookingData.booking.id, lessonId);
                                found = true;
                                break;
                            }
                        }
                    }
                }
            }

            // Update classboardModel for all event types (INSERT, UPDATE, DELETE)
            setClassboardModel((prevModel) => {
                return prevModel.map((bookingData) => {
                    const updatedLessons = bookingData.lessons.map((lesson) => {
                        if (lesson.id !== lessonId) return lesson;

                        const updatedEvents = (lesson.events || [])
                            .map((event) => {
                                // For INSERT: replace temp event with real event
                                if (eventType === "INSERT" && event.id.startsWith("temp-")) {
                                    return {
                                        ...event,
                                        id: eventId, // Replace temp ID with real ID
                                        date: convertedDate,
                                        duration,
                                        location,
                                        status,
                                    };
                                }

                                // For UPDATE/DELETE: match by real ID
                                if (event.id !== eventId) return event;

                                if (eventType === "DELETE") {
                                    return null; // Mark for deletion
                                }

                                return {
                                    ...event,
                                    date: convertedDate,
                                    duration,
                                    location,
                                    status,
                                };
                            })
                            .filter((e): e is NonNullable<typeof e> => e !== null); // Remove deleted

                        return { ...lesson, events: updatedEvents };
                    });

                    return { ...bookingData, lessons: updatedLessons };
                });
            });

            // Only clear real ID mutation for UPDATE/DELETE (INSERT uses temp ID which we already cleared)
            if (eventType !== "INSERT") {
                globalFlag.clearEventMutation(eventId);
            }
        },
        [globalFlag, setClassboardModel],
    );

    useAdminClassboardEventListener({
        onEventDetected: handleEventDetected,
        onEventUpdate: handleEventUpdate,
        getBookingIdForEvent,
    });
    useAdminClassboardBookingListener({ onNewBooking: handleNewBookingDetected });

    return <>{children}</>;
}
