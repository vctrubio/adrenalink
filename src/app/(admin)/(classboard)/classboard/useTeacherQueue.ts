import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
import type { TeacherQueue, ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";

interface UseTeacherQueueProps {
    queue: TeacherQueue;
    controller: ControllerSettings | null;
}

/**
 * useTeacherQueue - Hook to manage teacher queue editing state and operations
 * Encapsulates QueueController integration and adjustment mode logic
 */
export function useTeacherQueue({ queue, controller }: UseTeacherQueueProps) {
    const [isAdjustmentMode, setIsAdjustmentMode] = useState(false);
    
    /**
     * Mutation tick - Change detection mechanism for QueueController
     * 
     * QueueController mutates the queue in-place (event.eventData.date = newDate).
     * React can't detect these mutations automatically, so we increment this counter
     * every time QueueController makes a change. This forces React to recompute
     * memoized values (hasChanges, isQueueOptimised, optimisationStats).
     * 
     * Alternative would be immutable updates, but that's expensive for large queues.
     */
    const [mutationTick, setMutationTick] = useState(0);

    const triggerChangeDetection = useCallback(() => {
        setMutationTick(prev => prev + 1);
    }, []);

    // Initialize controller.locked to true (cascade mode) on first render
    useEffect(() => {
        if (controller && controller.locked === undefined) {
            controller.locked = true;
        }
    }, [controller]);

    // Create QueueController instance
    const queueController = useMemo(() => {
        if (!queue || !controller) return undefined;
        return new QueueController(queue, controller, triggerChangeDetection);
    }, [queue, controller, triggerChangeDetection]);

    // Start/exit adjustment mode in QueueController
    useEffect(() => {
        if (!queueController) return;
        
        if (isAdjustmentMode) {
            queueController.startAdjustmentMode();
        } else {
            queueController.exitAdjustmentMode();
        }
    }, [isAdjustmentMode, queueController]);

    // Exit adjustment mode if queue becomes empty
    const events = queue.getAllEvents();
    useEffect(() => {
        if (isAdjustmentMode && events.length === 0) {
            console.log("📤 [useTeacherQueue] Queue empty, exiting adjustment mode");
            setIsAdjustmentMode(false);
        }
    }, [events.length, isAdjustmentMode]);

    // Detect changes using QueueController
    const hasChanges = useMemo(() => {
        if (!queueController || !isAdjustmentMode) return false;
        return queueController.hasChanges();
    }, [queueController, isAdjustmentMode, mutationTick]);

    // Check if queue is optimised
    const isQueueOptimised = useMemo(() => {
        if (!queueController || !isAdjustmentMode) return true;
        return queueController.isQueueOptimised();
    }, [queueController, isAdjustmentMode, mutationTick]);

    // Get optimization stats
    const optimisationStats = useMemo(() => {
        if (!queueController || !isAdjustmentMode) return { adjusted: 0, total: 0 };
        return queueController.getOptimisationStats();
    }, [queueController, isAdjustmentMode, mutationTick]);

    // Handle submit
    const handleSubmit = useCallback(async () => {
        if (!queueController || !hasChanges) return;

        const { updates, deletions } = queueController.getChanges();
        if (updates.length === 0 && deletions.length === 0) return;

        try {
            console.log(`📤 [useTeacherQueue] Submitting ${updates.length} updates, ${deletions.length} deletions`);
            await bulkUpdateClassboardEvents(updates, deletions);
            console.log("✅ [useTeacherQueue] Changes submitted");
            
            setIsAdjustmentMode(false);
            toast.success(`${updates.length} event${updates.length > 1 ? 's' : ''} updated`);
        } catch (error) {
            console.error("❌ [useTeacherQueue] Error submitting changes:", error);
            toast.error("Failed to save changes");
        }
    }, [queueController, hasChanges]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (!queueController) return;
        queueController.resetToSnapshot();
    }, [queueController]);

    // Handle cancel
    const handleCancel = useCallback(() => {
        handleReset();
        setIsAdjustmentMode(false);
    }, [handleReset]);

    // Handle optimise
    const handleOptimise = useCallback(() => {
        if (!queueController) return;

        console.log("⚡ [useTeacherQueue] Optimising queue...");
        const { count } = queueController.optimiseQueue();

        if (count === 0) {
            toast.success("Queue already optimised");
            return;
        }

        // Auto-enable cascade mode after optimizing
        if (controller && !queueController.isLocked()) {
            controller.locked = true;
            triggerChangeDetection(); // Force re-render to update UI
            console.log("🔒 [useTeacherQueue] Auto-enabled cascade mode after optimization");
        }

        toast.success(`Queue optimised: ${count} events adjusted`);
    }, [queueController, controller, triggerChangeDetection]);

    // Handle lock toggle
    const handleToggleLock = useCallback(() => {
        if (!queueController || !controller) return;
        
        const newLockedState = !queueController.isLocked();
        controller.locked = newLockedState;
        triggerChangeDetection(); // Force re-render to update UI
        
        console.log(`🔒 [useTeacherQueue] Lock ${newLockedState ? 'enabled' : 'disabled'}`);
        toast.success(newLockedState ? "Cascade mode enabled" : "Time-respect mode enabled");
    }, [queueController, controller, triggerChangeDetection]);

    return {
        // State
        isAdjustmentMode,
        setIsAdjustmentMode,
        hasChanges,
        isQueueOptimised,
        optimisationStats,
        isLocked: queueController?.isLocked() ?? false, // Get from controller, not local state
        queueController,
        
        // Handlers
        handleSubmit,
        handleReset,
        handleCancel,
        handleOptimise,
        handleToggleLock,
    };
}
