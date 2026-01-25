"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { logger } from "@/backend/logger";
import { safeArray } from "@/backend/error-handlers";

export interface WizardEntity {
    id: string;
    title: string;
    subtitle: string;
    status?: string;
}

export async function getWizardEntities(entityType: string): Promise<WizardEntity[]> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) return [];

        const supabase = getServerConnection();

        switch (entityType) {
            case "student": {
                const { data, error } = await supabase
                    .from("school_students")
                    .select(
                        `
            student:student_id (
              id,
              first_name,
              last_name,
              country
            ),
            active
          `,
                    )
                    .eq("school_id", schoolId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;

                return safeArray(data).map((row: any) => ({
                    id: row.student.id,
                    title: `${row.student.first_name} ${row.student.last_name}`,
                    subtitle: row.student.country,
                    status: row.active ? "Active" : "Inactive",
                }));
            }

            case "teacher": {
                const { data, error } = await supabase
                    .from("teacher")
                    .select("id, username, first_name, last_name, active")
                    .eq("school_id", schoolId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;

                return safeArray(data).map((row: any) => ({
                    id: row.id,
                    title: row.username,
                    subtitle: `${row.first_name} ${row.last_name}`,
                    status: row.active ? "Active" : "Inactive",
                }));
            }

            case "schoolPackage": {
                const { data, error } = await supabase
                    .from("school_package")
                    .select("id, description, category_equipment, duration_minutes, active")
                    .eq("school_id", schoolId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;

                return safeArray(data).map((row: any) => ({
                    id: row.id,
                    title: row.description,
                    subtitle: `${row.category_equipment} - ${row.duration_minutes} min`,
                    status: row.active ? "Active" : "Inactive",
                }));
            }

            case "booking": {
                const { data, error } = await supabase
                    .from("booking")
                    .select("id, status")
                    .eq("school_id", schoolId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;

                return safeArray(data).map((row: any) => ({
                    id: row.id,
                    title: `Booking ${row.id.substring(0, 8)}`,
                    subtitle: row.status,
                    status: row.status,
                }));
            }

            case "equipment": {
                const { data, error } = await supabase
                    .from("equipment")
                    .select("id, model, sku, category, status")
                    .eq("school_id", schoolId)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (error) throw error;

                return safeArray(data).map((row: any) => ({
                    id: row.id,
                    title: `${row.model} ${row.sku}`,
                    subtitle: row.category,
                    status: row.status,
                }));
            }

            default:
                return [];
        }
    } catch (error) {
        logger.error("Error fetching wizard entities", { entityType, error });
        return [];
    }
}
