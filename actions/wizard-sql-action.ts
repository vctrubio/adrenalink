"use server";

import { sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";

export interface WizardEntity {
    id: string;
    title: string;
    subtitle: string;
    status?: string;
}

export async function getWizardEntities(entityType: string): Promise<WizardEntity[]> {
    try {
        const schoolHeader = await getSchoolHeader();
        const schoolId = schoolHeader?.id;

        if (!schoolId) return [];

        let query;

        switch (entityType) {
            case "student":
                query = sql`
                    SELECT 
                        s.id,
                        s.first_name || ' ' || s.last_name as title,
                        s.country as subtitle,
                        CASE WHEN ss.active THEN 'Active' ELSE 'Inactive' END as status
                    FROM student s
                    JOIN school_students ss ON ss.student_id = s.id
                    WHERE ss.school_id = ${schoolId}
                    ORDER BY s.created_at DESC
                    LIMIT 50
                `;
                break;
            case "teacher":
                query = sql`
                    SELECT 
                        id,
                        username as title,
                        first_name || ' ' || last_name as subtitle,
                        CASE WHEN active THEN 'Active' ELSE 'Inactive' END as status
                    FROM teacher
                    WHERE school_id = ${schoolId}
                    ORDER BY created_at DESC
                    LIMIT 50
                `;
                break;
            case "schoolPackage":
                query = sql`
                    SELECT 
                        id,
                        description as title,
                        category_equipment || ' - ' || duration_minutes || ' min' as subtitle,
                        CASE WHEN active THEN 'Active' ELSE 'Inactive' END as status
                    FROM school_package
                    WHERE school_id = ${schoolId}
                    ORDER BY created_at DESC
                    LIMIT 50
                `;
                break;
            case "booking":
                query = sql`
                    SELECT 
                        b.id,
                        'Booking ' || SUBSTRING(b.id::text, 1, 8) as title,
                        b.status as subtitle,
                        b.status as status
                    FROM booking b
                    WHERE b.school_id = ${schoolId}
                    ORDER BY b.created_at DESC
                    LIMIT 50
                `;
                break;
            case "equipment":
                query = sql`
                    SELECT 
                        id,
                        model || ' ' || sku as title,
                        category as subtitle,
                        status
                    FROM equipment
                    WHERE school_id = ${schoolId}
                    ORDER BY created_at DESC
                    LIMIT 50
                `;
                break;
            default:
                return [];
        }

        const result = await db.execute(query);
        // Normalize rows for different drivers (pg vs vercel-postgres etc)
        const rows = Array.isArray(result) ? result : (result as any).rows || [];

        return rows.map((row: any) => ({
            id: row.id,
            title: row.title || "Unknown",
            subtitle: row.subtitle || "",
            status: row.status,
        }));
    } catch (error) {
        console.error(`Error fetching wizard entities for ${entityType}:`, error);
        return [];
    }
}
