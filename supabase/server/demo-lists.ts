import { getServerConnection } from "@/supabase/connection";
import { getUserSchoolContext } from "@/types/user-school-provider";

export async function getDemoSchoolLists() {
    const context = await getUserSchoolContext();

    if (!context.school?.id) {
        return { success: false, error: "No school context found" };
    }

    const supabase = getServerConnection();
    const schoolId = context.school.id;

    try {
        const [teachersResult, studentsResult, schoolResult] = await Promise.all([
            supabase
                .from("teacher")
                .select("id, first_name, last_name, username, active, clerk_id")
                .eq("school_id", schoolId)
                .order("first_name"),
            supabase
                .from("school_students")
                .select(
                    `
                    student_id,
                    clerk_id,
                    student:student_id (id, first_name, last_name),
                    rental
                `,
                )
                .eq("school_id", schoolId),
            supabase.from("school").select("id, clerk_id, username").eq("id", schoolId).single(),
        ]);

        if (teachersResult.error) throw teachersResult.error;
        if (studentsResult.error) throw studentsResult.error;
        if (schoolResult.error) throw schoolResult.error;

        // Flatten student structure
        const students = studentsResult.data
            .map((item: any) => ({
                id: item.student.id,
                first_name: item.student.first_name,
                last_name: item.student.last_name,
                rental: item.rental,
                clerk_id: item.clerk_id, // Used to determine linked status
            }))
            .sort((a, b) => a.first_name.localeCompare(b.first_name));

        return {
            success: true,
            data: {
                teachers: teachersResult.data,
                students: students,
                owner: schoolResult.data,
                schoolName: context.school.username,
            },
        };
    } catch (error) {
        console.error("Error fetching demo lists:", error);
        return { success: false, error: "Failed to fetch lists" };
    }
}
