import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { EquipmentWithRepairsRentalsEvents, EquipmentTableData } from "@/config/tables";
import { calculateEquipmentStats } from "@/backend/data/EquipmentData";

export async function getEquipmentsTable(): Promise<EquipmentTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            console.error("❌ No school ID found in headers");
            return [];
        }

        const supabase = getServerConnection();

        // Fetch equipment with teachers, repairs, and events
        const { data, error } = await supabase
            .from("equipment")
            .select(`
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
            `)
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching equipments table:", error);
            return [];
        }

        return data.map((e: any) => {
            // Map usage stats from events
            const teacherUsageMap: Record<string, { eventCount: number; durationMinutes: number }> = {};
            
            const equipmentEvents = (e.equipment_event || [])
                .filter((ee: any) => ee.event);
            
            equipmentEvents.forEach((ee: any) => {
                const evt = ee.event;
                const teacherId = evt.lesson?.teacher_id;
                if (teacherId) {
                    if (!teacherUsageMap[teacherId]) {
                        teacherUsageMap[teacherId] = { eventCount: 0, durationMinutes: 0 };
                    }
                    teacherUsageMap[teacherId].eventCount += 1;
                    teacherUsageMap[teacherId].durationMinutes += (evt.duration || 0);
                }
            });

            // Map active assigned teachers and merge usage stats
            const assignedTeachers = (e.teacher_equipment || [])
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
            const repairCount = (e.equipment_repair || []).length;

            // Map rentals
            const rentalCount = e.rental_equipment?.[0]?.count || 0;

            // Map events and calculate duration
            const eventCount = equipmentEvents.length;
            const totalDurationMinutes = equipmentEvents.reduce((sum: number, ee: any) => sum + (ee.event.duration || 0), 0);

            const result: EquipmentWithRepairsRentalsEvents = {
                id: e.id,
                sku: e.sku,
                brand: e.brand,
                model: e.model,
                color: e.color,
                size: e.size ? parseFloat(e.size) : null,
                category: e.category,
                status: e.status || "rental",
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

            const stats = calculateEquipmentStats(result);
            
            return {
                ...result,
                stats
            };
        });
    } catch (error) {
        console.error("Unexpected error in getEquipmentsTable:", error);
        return [];
    }
}
