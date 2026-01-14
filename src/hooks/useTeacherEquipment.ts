"use client";

import { useState, useCallback } from "react";
import { getClientConnection } from "@/supabase/connection";

export interface TeacherEquipmentItem {
    id: string;
    brand?: string;
    model: string;
    size: number | null;
    sku?: string;
    color?: string;
    category?: string;
    status?: string;
}

export function useTeacherEquipment(teacherId: string, categoryFilter?: string) {
    const [equipment, setEquipment] = useState<TeacherEquipmentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEquipment = useCallback(async () => {
        if (!teacherId) {
            console.warn("[useTeacherEquipment] No teacherId provided");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const supabase = getClientConnection();

            let query = supabase
                .from("teacher_equipment")
                .select(`
                    equipment_id,
                    active,
                    equipment (
                        id,
                        brand,
                        model,
                        size,
                        sku,
                        color,
                        category,
                        status
                    )
                `)
                .eq("teacher_id", teacherId)
                .eq("active", true);

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.error("[useTeacherEquipment] Error fetching equipment:", fetchError);
                setError("Failed to fetch equipment");
                setEquipment([]);
                return;
            }

            // Map to flat equipment list and filter by category if provided
            let items: TeacherEquipmentItem[] = (data || [])
                .map((item: any) => item.equipment)
                .filter((eq: any) => eq && eq.id);

            if (categoryFilter) {
                items = items.filter((eq) => eq.category === categoryFilter);
            }

            console.log(`[useTeacherEquipment] Fetched ${items.length} items for teacher ${teacherId}`, items);
            setEquipment(items);
        } catch (err) {
            console.error("[useTeacherEquipment] Unexpected error:", err);
            setError("An unexpected error occurred");
            setEquipment([]);
        } finally {
            setIsLoading(false);
        }
    }, [teacherId, categoryFilter]);

    return {
        equipment,
        isLoading,
        error,
        fetchEquipment,
    };
}
