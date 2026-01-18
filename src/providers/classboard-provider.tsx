"use client";

/**
 * ClassboardProvider - Context wrapper for useClassboardFlag hook
 *
 * This provider simply wraps the useClassboardFlag hook and exposes
 * its return value through React Context for consumption by child components.
 *
 * ALL logic is centralized in useClassboardFlag hook.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useClassboardFlag, optimisticEventToNode, type OptimisticEvent, type EventCardStatus } from "@/src/hooks/useClassboardFlag";
import type { ClassboardModel, ClassboardData } from "@/backend/classboard/ClassboardModel";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/backend/classboard/TeacherQueue";
import type { GlobalFlag } from "@/backend/classboard/GlobalFlag";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { QueueController } from "@/backend/classboard/QueueController";

// Re-export for backwards compatibility
export { optimisticEventToNode };
export type { OptimisticEvent, EventCardStatus };

interface ClassboardContextType {
    // Data
    classboardModel: ClassboardModel;
    bookingsForSelectedDate: ClassboardData[];
    teacherQueues: TeacherQueue[];
    mounted: boolean;
    error: string | null;

    // Date selection
    selectedDate: string;
    setSelectedDate: (date: string) => void;

    // Drag state
    draggedBooking: DraggableBooking | null;
    setDraggedBooking: (booking: DraggableBooking | null) => void;

    // Event actions
    addLessonEvent: (bookingData: ClassboardData, lessonId: string) => Promise<void>;
    deleteEvent: (eventId: string, cascade: boolean, queueController?: QueueController) => Promise<void>;
    updateEventStatus: (eventId: string, status: string) => Promise<void>;

    // UI Status
    getEventCardStatus: (eventId: string) => EventCardStatus | undefined;

    // Global flag
    globalFlag: GlobalFlag;

    // Internal (for ClassboardRealtimeSync)
    setClassboardModel: (model: ClassboardModel | ((prev: ClassboardModel) => ClassboardModel)) => void;
}

export const ClassboardContext = createContext<ClassboardContextType | undefined>(undefined);

interface ClassboardProviderProps {
    children: ReactNode;
    initialClassboardModel: ClassboardModel | null;
    serverError?: string | null;
}

export function ClassboardProvider({ children, initialClassboardModel, serverError }: ClassboardProviderProps) {
    const hookValue = useClassboardFlag({ initialClassboardModel, serverError });

    console.log(
        `🏛️ [ClassboardProvider] Render - Queues: ${hookValue.teacherQueues.length}, Events: ${hookValue.bookingsForSelectedDate.length}, Mounted: ${hookValue.mounted}`,
    );

    return <ClassboardContext.Provider value={hookValue}>{children}</ClassboardContext.Provider>;
}

export function useClassboardContext(): ClassboardContextType {
    const context = useContext(ClassboardContext);
    if (!context) {
        throw new Error("useClassboardContext must be used within ClassboardProvider");
    }
    return context;
}
