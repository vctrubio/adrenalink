import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { EquipmentData, EquipmentUpdateForm, EquipmentRelations } from "@/backend/data/EquipmentData";
import { Equipment } from "@/supabase/db/types";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

/**
 * Fetches equipment by ID with all relations mapped to EquipmentData interface.
 */
export async function getEquipmentId(id: string): Promise<{ success: boolean; data?: EquipmentData; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Fetch equipment with core relations
        const { data: equipment, error: equipmentError } = await supabase
            .from("equipment")
            .select(
                `
                *,
                equipment_repair(*),
                teacher_equipment(
                    teacher(*)
                ),
                equipment_event(
                    event(
                        *,
                        lesson(
                            booking(
                                id,
                                leader_student_name,
                                school_package(*)
                            )
                        )
                    )
                ),
                rental_equipment(
                    rental(
                        *,
                        rental_student(
                            student(*)
                        )
                    )
                )
            `,
            )
            .eq("id", id)
            .eq("school_id", schoolHeader.id)
            .single();

        if (equipmentError || !equipment) {
            return handleSupabaseError(equipmentError, "fetch equipment details", "Equipment not found");
        }

        // Map Relations
        const relations: EquipmentRelations = {
            repairs: safeArray(equipment.equipment_repair).map((r: any) => ({
                id: r.id,
                description: r.description,
                created_at: r.created_at,
            })),
            teachers: safeArray(equipment.teacher_equipment).map((te: any) => te.teacher).filter(Boolean),
            events: safeArray(equipment.equipment_event)
                .map((ee: any) => {
                    if (!ee.event) return null;
                    return {
                        ...ee.event,
                        lesson: ee.event.lesson,
                    };
                })
                .filter(Boolean),
            rentals: safeArray(equipment.rental_equipment)
                .map((re: any) => {
                    if (!re.rental) return null;
                    return {
                        ...re.rental,
                        students: safeArray(re.rental.rental_student).map((rs: any) => rs.student).filter(Boolean),
                    };
                })
                .filter(Boolean),
        };

        const schema: Equipment = {
            id: equipment.id,
            sku: equipment.sku,
            brand: equipment.brand,
            model: equipment.model,
            color: equipment.color,
            size: equipment.size,
            status: equipment.status,
            school_id: equipment.school_id,
            category: equipment.category,
            created_at: equipment.created_at,
            updated_at: equipment.updated_at,
        };

        const updateForm: EquipmentUpdateForm = { ...schema };

        const equipmentData: EquipmentData = {
            schema,
            updateForm,
            relations,
        };

        logger.debug("Fetched equipment details", { equipmentId: id, schoolId: schoolHeader.id });
        return { success: true, data: equipmentData };
    } catch (error) {
        logger.error("Error fetching equipment details", error);
        return { success: false, error: "Failed to fetch equipment" };
    }
}
