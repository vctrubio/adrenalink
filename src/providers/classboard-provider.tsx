"use client";

/**
 * ClassboardProvider - Context wrapper for useClassboardFlag hook
 *
 * This provider simply wraps the useClassboardFlag hook and exposes
 * its return value through React Context for consumption by child components.
 *
 * ALL logic is centralized in useClassboardFlag hook.
 */

import { createContext, useContext, type ReactNode } from "react";
import {
    useClassboardFlag,
    optimisticEventToNode,
    type OptimisticEvent,
    type EventCardStatus,
} from "@/src/hooks/useClassboardFlag";
import type { ClassboardModel, ClassboardData } from "@/backend/models/ClassboardModel";
import type { TeacherQueue, ControllerSettings, EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { DraggableBooking } from "@/types/classboard-teacher-queue";
import type { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";

// Re-export for backwards compatibility
export { optimisticEventToNode };
export type { OptimisticEvent, EventCardStatus };

interface ClassboardContextType {
    // Data
    classboardModel: ClassboardModel;
    bookingsForSelectedDate: ClassboardData[];
    teacherQueues: TeacherQueue[];
    mounted: boolean;

    // Date selection
    selectedDate: string;
    setSelectedDate: (date: string) => void;

    // Controller settings
    controller: ControllerSettings;
    setController: (controller: ControllerSettings) => void;
    gapMinutes: number;

    // Drag state
    draggedBooking: DraggableBooking | null;
    setDraggedBooking: (booking: DraggableBooking | null) => void;

    // Event actions
    addLessonEvent: (bookingData: ClassboardData, lessonId: string) => Promise<void>;
    deleteEvent: (eventId: string, cascade: boolean, queueController?: QueueController) => Promise<void>;

    // Optimistic updates
    optimisticEvents: Map<string, OptimisticEvent>;
    setOptimisticEvents: (events: Map<string, OptimisticEvent> | ((prev: Map<string, OptimisticEvent>) => Map<string, OptimisticEvent>)) => void;
    clearOptimisticEvents: () => void;
    getEventCardStatus: (eventId: string) => EventCardStatus | undefined;

    // Global flag
    globalFlag: GlobalFlag;

    // Internal (for ClassboardRealtimeSync)
    setClassboardModel: (model: ClassboardModel | ((prev: ClassboardModel) => ClassboardModel)) => void;
}

const ClassboardContext = createContext<ClassboardContextType | undefined>(undefined);

interface ClassboardProviderProps {
    children: ReactNode;
    initialClassboardModel: ClassboardModel;
}

export function ClassboardProvider({ children, initialClassboardModel }: ClassboardProviderProps) {
    console.log(`🏛️ [ClassboardProvider] Render`);

    const hookValue = useClassboardFlag({ initialClassboardModel });

    return (
        <ClassboardContext.Provider value={hookValue}>
            {children}
        </ClassboardContext.Provider>
    );
}

export function useClassboardContext(): ClassboardContextType {
    const context = useContext(ClassboardContext);
    if (!context) {
        throw new Error("useClassboardContext must be used within ClassboardProvider");
    }
    return context;
}
