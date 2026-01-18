"use server";

import { revalidatePath } from "next/cache";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolId } from "@/backend/school-context";
import type { EquipmentWithRepairsRentalsEvents, EquipmentTableData } from "@/config/tables";
import { calculateEquipmentStats } from "@/backend/data/EquipmentData";
import { safeArray, handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function getEquipmentsTable(): Promise<EquipmentTableData[]> {
    try {
        const schoolId = await getSchoolId();

        if (!schoolId) {
            return [];
        }

        const supabase = getServerConnection();

        // Fetch equipment with teachers, repairs, and events
        const { data, error } = await supabase
            .from("equipment")
            .select(
                `
                *,
                teacher_equipment (
                    active,
                    teacher (
                        id,
                        username
                    )
                ),
                equipment_repair (
                    id
                ),
                rental_equipment (
                    count
                ),
                equipment_event (
                    event (
                        duration,
                        lesson (
                            teacher_id
                        )
                    )
                )
            `,
            )
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching equipments table", error);
            return [];
        }

        const result = safeArray(data).map((e: any) => {
            // Map usage stats from events
            const teacherUsageMap: Record<string, { eventCount: number; durationMinutes: number }> = {};

            const equipmentEvents = safeArray(e.equipment_event).filter((ee: any) => ee.event);

            equipmentEvents.forEach((ee: any) => {
                const evt = ee.event;
                const teacherId = evt.lesson?.teacher_id;
                if (teacherId) {
                    if (!teacherUsageMap[teacherId]) {
                        teacherUsageMap[teacherId] = { eventCount: 0, durationMinutes: 0 };
                    }
                    teacherUsageMap[teacherId].eventCount += 1;
                    teacherUsageMap[teacherId].durationMinutes += evt.duration || 0;
                }
            });

            // Map active assigned teachers and merge usage stats
            const assignedTeachers = safeArray(e.teacher_equipment)
                .filter((te: any) => te.active && te.teacher)
                .map((te: any) => {
                    const usage = teacherUsageMap[te.teacher.id] || { eventCount: 0, durationMinutes: 0 };
                    return {
                        id: te.teacher.id,
                        username: te.teacher.username,
                        eventCount: usage.eventCount,
                        durationMinutes: usage.durationMinutes,
                    };
                });

            // Map repairs
            const repairCount = safeArray(e.equipment_repair).length;

            // Map rentals
            const rentalCount = e.rental_equipment?.[0]?.count || 0;

            // Map events and calculate duration
            const eventCount = equipmentEvents.length;
            const totalDurationMinutes = equipmentEvents.reduce((sum: number, ee: any) => sum + (ee.event.duration || 0), 0);

            const equipmentResult: EquipmentWithRepairsRentalsEvents = {
                id: e.id,
                sku: e.sku,
                brand: e.brand,
                model: e.model,
                color: e.color,
                size: e.size ? parseFloat(e.size) : null,
                category: e.category,
                status: e.status || "rental",
                createdAt: e.created_at,
                assignedTeachers,
                repairStats: {
                    count: repairCount,
                },
                rentalStats: {
                    count: rentalCount,
                },
                activityStats: {
                    eventCount,
                    totalDurationMinutes,
                },
            };

            const stats = calculateEquipmentStats(equipmentResult);

            return {
                ...equipmentResult,
                stats,
            };
        });

        logger.debug("Fetched equipments table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching equipments table", error);
        return [];
    }
}

export async function updateEquipment(
    equipmentId: string,
    updateData: {
        sku: string;
        brand: string;
        model: string;
        color?: string | null;
        size?: number | null;
        status: string;
    },
): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolId = await getSchoolId();

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Update equipment
        const { error } = await supabase
            .from("equipment")
            .update({
                sku: updateData.sku,
                brand: updateData.brand,
                model: updateData.model,
                color: updateData.color,
                size: updateData.size,
                status: updateData.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", equipmentId)
            .eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "update equipment", "Failed to update equipment");
        }

        logger.info("Updated equipment", { equipmentId });
        revalidatePath("/equipments");
        revalidatePath(`/equipments/${equipmentId}`);
        return { success: true };
    } catch (error) {
        logger.error("Error updating equipment", error);
        return { success: false, error: "Failed to update equipment" };
    }
}

export async function deleteEquipment(equipmentId: string): Promise<{ success: boolean; error?: string; canDelete?: boolean }> {
    try {
        const schoolId = await getSchoolId();

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Check if equipment has any events
        const { data: events } = await supabase.from("equipment_event").select("id").eq("equipment_id", equipmentId).limit(1);

        if (events && events.length > 0) {
            return {
                success: false,
                canDelete: false,
                error: "Cannot delete equipment with events",
            };
        }

        // Check if equipment has any rentals
        const { data: rentals } = await supabase.from("rental_equipment").select("id").eq("equipment_id", equipmentId).limit(1);

        if (rentals && rentals.length > 0) {
            return {
                success: false,
                canDelete: false,
                error: "Cannot delete equipment with rentals",
            };
        }

        // Delete equipment (cascade will handle teacher_equipment and equipment_repair)
        const { error } = await supabase.from("equipment").delete().eq("id", equipmentId).eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "delete equipment", "Failed to delete equipment");
        }

        logger.info("Deleted equipment", { equipmentId });
        revalidatePath("/equipments");
        return { success: true, canDelete: true };
    } catch (error) {
        logger.error("Error deleting equipment", error);
        return { success: false, error: "Failed to delete equipment" };
    }
}
