import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerConnection } from "@/supabase/connection";
import { createDefaultSchoolPackages } from "@/supabase/seeding/package";
import { createTeachers } from "@/supabase/seeding/teacher";
import { createStudents, associateStudentsWithSchool } from "@/supabase/seeding/student";
import { createDefaultTeacherCommissions } from "@/supabase/seeding/commission";
import { createDefaultEquipment } from "@/supabase/seeding/equipment";

/**
 * POST /api/beta
 * Beta seeding endpoint for packages, teachers, and students
 * Gets schoolId from x-school-id header or looks it up from x-school-username
 */
export async function POST(request: NextRequest) {
    try {
        const headersList = await headers();
        const { type, schoolId: bodySchoolId } = await request.json();
        
        // Prefer schoolId from body, fallback to headers
        let schoolId = bodySchoolId || headersList.get("x-school-id");

        // If still no schoolId, look it up from username header
        if (!schoolId) {
            const username = headersList.get("x-school-username");
            if (username) {
                const supabase = getServerConnection();
                const { data: school } = await supabase.from("school").select("id").eq("username", username).single();
                if (school) {
                    schoolId = school.id;
                }
            }
        }

        if (!schoolId) {
            return NextResponse.json({ error: "School ID not found" }, { status: 400 });
        }

        if (!type || !["package", "teacher", "student", "equipment"].includes(type)) {
            return NextResponse.json({ error: "Type must be 'package', 'teacher', 'student', or 'equipment'" }, { status: 400 });
        }

        let result;

        switch (type) {
            case "package":
                const packages = await createDefaultSchoolPackages(schoolId);
                // Update school status to beta
                const supabase = getServerConnection();
                const { error: updateError } = await supabase.from("school").update({ status: "beta" }).eq("id", schoolId);
                if (updateError) {
                    console.error("Error updating school status:", updateError);
                }
                result = { success: true, type: "package", count: packages.length };
                break;

            case "teacher":
                const teachers = await createTeachers(schoolId, 2);
                // Create default commissions for each teacher
                for (const teacher of teachers) {
                    await createDefaultTeacherCommissions(teacher.id);
                }
                result = { success: true, type: "teacher", count: teachers.length };
                break;

            case "student":
                const students = await createStudents(8);
                await associateStudentsWithSchool(schoolId, students);
                result = { success: true, type: "student", count: students.length };
                break;

            case "equipment":
                const equipment = await createDefaultEquipment(schoolId);
                result = { success: true, type: "equipment", count: equipment.length };
                break;

            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error in beta seeding:", error);
        return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
