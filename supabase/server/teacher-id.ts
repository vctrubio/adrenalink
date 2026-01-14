import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { TeacherData, TeacherUpdateForm, TeacherRelations } from "@/backend/data/TeacherData";
import { Teacher } from "@/supabase/db/types";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import { headers } from "next/headers";

/**
 * Fetches a teacher by ID with all relations mapped to TeacherData interface.
 */
export async function getTeacherId(id: string): Promise<{ success: boolean; data?: TeacherData; error?: string }> {
    try {
        const headersList = await headers();
        let schoolId = headersList.get("x-school-id");
        let timezone = headersList.get("x-school-timezone");

        if (!schoolId) {
            const schoolHeader = await getSchoolHeader();
            if (!schoolHeader) {
                return { success: false, error: "School context not found" };
            }
            schoolId = schoolHeader.id;
            timezone = schoolHeader.timezone;
        } else if (!timezone) {
            const schoolHeader = await getSchoolHeader();
            if (schoolHeader) timezone = schoolHeader.timezone;
        }

        const supabase = getServerConnection();

        // Fetch teacher with core relations
        const { data: teacher, error: teacherError } = await supabase
            .from("teacher")
            .select(
                `
                *,
                teacher_commission(*),
                lesson(
                    *,
                    teacher_commission(*),
                    booking(
                        *,
                        school_package(*),
                        booking_student(
                            student(*)
                        )
                    ),
                    event(
                        *,
                        equipment_event(
                            equipment(
                                id,
                                brand,
                                model,
                                size,
                                sku,
                                color,
                                category
                            )
                        )
                    ),
                    teacher_lesson_payment(*)
                ),
                teacher_equipment(
                    *,
                    equipment(*)
                )
            `,
            )
            .eq("id", id)
            .eq("school_id", schoolId)
            .single();

        if (teacherError || !teacher) {
            console.error("Error fetching teacher details:", teacherError);
            return { success: false, error: "Teacher not found" };
        }

        // Map Relations to standardized snake_case
        const relations: TeacherRelations = {
            teacher_commission: teacher.teacher_commission || [],
            lesson: (teacher.lesson || []).map((l: any) => {
                // Convert event times if timezone is available and map equipment
                const events = (l.event || []).map((evt: any) => {
                    const equipments = (evt.equipment_event || []).map((ee: any) => ({
                        id: ee.equipment.id,
                        brand: ee.equipment.brand,
                        model: ee.equipment.model,
                        size: ee.equipment.size,
                        sku: ee.equipment.sku,
                        color: ee.equipment.color,
                        category: ee.equipment.category,
                    }));
                    
                    const eventData: any = {
                        ...evt,
                        equipments: equipments.length > 0 ? equipments : undefined,
                    };
                    
                    if (timezone) {
                        const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), timezone!);
                        eventData.date = convertedDate.toISOString();
                    }
                    
                    return eventData;
                });

                // Extract students from booking_student junction table
                const students = (l.booking?.booking_student || []).map((bs: any) => ({
                    id: bs.student.id,
                    first_name: bs.student.first_name,
                    last_name: bs.student.last_name,
                }));

                return {
                    ...l,
                    teacher_commission: l.teacher_commission,
                    booking: l.booking
                        ? {
                              ...l.booking,
                              students,
                          }
                        : undefined,
                    event: events,
                    teacher_lesson_payment: l.teacher_lesson_payment || [],
                };
            }),
            teacher_equipment: teacher.teacher_equipment || [],
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
