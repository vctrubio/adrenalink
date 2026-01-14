"use client";

import { useState, useCallback } from "react";
import { getAvailableEquipment, assignEquipmentToEvent, unassignEquipmentFromEvent } from "@/supabase/server/classboard";
import toast from "react-hot-toast";

export function useEquipment(category: string) {
    const [availableEquipment, setAvailableEquipment] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAvailable = useCallback(async () => {
        if (!category) {
            console.warn("[useEquipment] No category provided");
            return;
        }
        setIsLoading(true);
        try {
            const result = await getAvailableEquipment(category);
            if (result.success) {
                console.log(`[useEquipment] 🔍 Fetched ${result.data?.length} items for ${category}:`, result.data?.[0]);
                setAvailableEquipment(result.data || []);
            } else {
                console.error("Failed to fetch equipment:", result.error);
                toast.error(result.error || "Failed to fetch available equipment");
                setAvailableEquipment([]);
            }
        } catch (error) {
            console.error("Error in fetchAvailable:", error);
            toast.error("An unexpected error occurred while fetching equipment");
            setAvailableEquipment([]);
        } finally {
            setIsLoading(false);
        }
    }, [category]);

    const assign = useCallback(async (eventId: string, equipmentId: string) => {
        const result = await assignEquipmentToEvent(eventId, equipmentId);
        if (result.success) {
            toast.success("Equipment assigned");
            return true;
        } else {
            toast.error(result.error || "Failed to assign equipment");
            return false;
        }
    }, []);

    const unassign = useCallback(async (eventId: string, equipmentId: string) => {
        const result = await unassignEquipmentFromEvent(eventId, equipmentId);
        if (result.success) {
            toast.success("Equipment unassigned");
            return true;
        } else {
            toast.error(result.error || "Failed to unassign equipment");
            return false;
        }
    }, []);

    return {
        availableEquipment,
        isLoading,
        fetchAvailable,
        assign,
        unassign,
    };
}
