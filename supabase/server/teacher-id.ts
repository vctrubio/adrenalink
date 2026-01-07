import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { TeacherData, TeacherUpdateForm, TeacherRelations } from "@/backend/data/TeacherData";
import { Teacher } from "@/supabase/db/types";

/**
 * Fetches a teacher by ID with all relations mapped to TeacherData interface.
 */
export async function getTeacherId(id: string): Promise<{ success: boolean; data?: TeacherData; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Fetch teacher with core relations
        const { data: teacher, error: teacherError } = await supabase
            .from("teacher")
            .select(`
                *,
                teacher_commission(*),
                lesson(
                    *,
                    teacher_commission(*),
                    booking(
                        *,
                        school_package(*)
                    ),
                    event(*),
                    teacher_lesson_payment(*)
                ),
                teacher_equipment(
                    *,
                    equipment(*)
                )
            `)
            .eq("id", id)
            .eq("school_id", schoolHeader.id)
            .single();

        if (teacherError || !teacher) {
            console.error("Error fetching teacher details:", teacherError);
            return { success: false, error: "Teacher not found" };
        }

        // Map Relations
        const relations: TeacherRelations = {
            commissions: teacher.teacher_commission || [],
            lessons: (teacher.lesson || []).map((l: any) => ({
                ...l,
                booking: l.booking,
                events: l.event || [],
                teacher_commission: l.teacher_commission, // Ensure this field exists for RightColumn
                teacherLessonPayments: (l.teacher_lesson_payment || []).map((p: any) => ({
                    id: p.id,
                    amount: p.amount,
                    createdAt: p.created_at,
                })),
            })),
            equipments: teacher.teacher_equipment || [],
        };

        const schema: Teacher = {
            id: teacher.id,
            school_id: teacher.school_id,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            username: teacher.username,
            passport: teacher.passport,
            country: teacher.country,
            phone: teacher.phone,
            languages: teacher.languages,
            active: teacher.active,
            created_at: teacher.created_at,
            updated_at: teacher.updated_at,
        };

        const updateForm: TeacherUpdateForm = { ...schema };

        const teacherData: TeacherData = {
            schema,
            updateForm,
            relations,
        };

        return { success: true, data: teacherData };
    } catch (error) {
        console.error("Unexpected error in getTeacherId:", error);
        return { success: false, error: "Failed to fetch teacher" };
    }
}
