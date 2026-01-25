"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export interface LessonData {
    id: string;
    school_id: string;
    teacher_id: string;
    booking_id: string;
    commission_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface LessonForm {
    bookingId: string;
    teacherId: string;
    commissionId: string;
    status?: string;
}

/**
 * Create a new lesson
 */
export async function createLesson(lessonData: LessonForm): Promise<ApiActionResponseModel<LessonData>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School ID not found in headers" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("lesson")
            .insert({
                school_id: schoolId,
                teacher_id: lessonData.teacherId,
                booking_id: lessonData.bookingId,
                commission_id: lessonData.commissionId,
                status: lessonData.status || "active",
            })
            .select()
            .single();

        if (error) {
            return handleSupabaseError(error, "create lesson", "Failed to create lesson");
        }

        logger.info("Created lesson", { lessonId: data.id, bookingId: lessonData.bookingId, teacherId: lessonData.teacherId });
        revalidatePath("/lessons");
        revalidatePath("/classboard");
        return { success: true, data };
    } catch (error) {
        logger.error("Error creating lesson", error);
        return { success: false, error: "Failed to create lesson" };
    }
}

/**
 * Create a lesson with commission in one operation
 */
export async function createLessonWithCommission(
    bookingId: string,
    teacherId: string,
    commissionId: string,
): Promise<ApiActionResponseModel<LessonData>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School ID not found in headers" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("lesson")
            .insert({
                school_id: schoolId,
                teacher_id: teacherId,
                booking_id: bookingId,
                commission_id: commissionId,
                status: "active",
            })
            .select()
            .single();

        if (error) {
            return handleSupabaseError(error, "create lesson with commission", "Failed to create lesson");
        }

        logger.info("Created lesson with commission", { lessonId: data.id, bookingId, teacherId, commissionId });
        revalidatePath(`/bookings/${bookingId}`);
        revalidatePath("/teachers");

        return { success: true, data };
    } catch (error) {
        logger.error("Error creating lesson with commission", error);
        return { success: false, error: "Failed to create lesson" };
    }
}

/**
 * Get all lessons
 */
export async function getLessons(): Promise<ApiActionResponseModel<LessonData[]>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School ID not found in headers" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("lesson")
            .select("*")
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(error, "fetch lessons", "Failed to fetch lessons");
        }

        logger.debug("Fetched lessons", { schoolId, count: safeArray(data).length });
        return { success: true, data: safeArray(data) };
    } catch (error) {
        logger.error("Error fetching lessons", error);
        return { success: false, error: "Failed to fetch lessons" };
    }
}

/**
 * Get a lesson by ID
 */
export async function getLessonById(lessonId: string): Promise<ApiActionResponseModel<LessonData>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("lesson").select("*").eq("id", lessonId).single();

        if (error) {
            return handleSupabaseError(error, "fetch lesson by ID", "Lesson not found");
        }

        return { success: true, data };
    } catch (error) {
        logger.error("Error fetching lesson", error);
        return { success: false, error: "Failed to fetch lesson" };
    }
}

/**
 * Get lessons by booking ID
 */
export async function getLessonsByBookingId(bookingId: string): Promise<ApiActionResponseModel<LessonData[]>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("lesson")
            .select("*")
            .eq("booking_id", bookingId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(error, "fetch lessons by booking", "Failed to fetch lessons");
        }

        logger.debug("Fetched lessons by booking", { bookingId, count: safeArray(data).length });
        return { success: true, data: safeArray(data) };
    } catch (error) {
        logger.error("Error fetching lessons by booking", error);
        return { success: false, error: "Failed to fetch lessons" };
    }
}

/**
 * Get lessons by teacher ID
 */
export async function getLessonsByTeacherId(teacherId: string): Promise<ApiActionResponseModel<LessonData[]>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("lesson")
            .select("*")
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(error, "fetch lessons by teacher", "Failed to fetch lessons");
        }

        logger.debug("Fetched lessons by teacher", { teacherId, count: safeArray(data).length });
        return { success: true, data: safeArray(data) };
    } catch (error) {
        logger.error("Error fetching lessons by teacher", error);
        return { success: false, error: "Failed to fetch lessons" };
    }
}

/**
 * Update lesson status or other fields
 */
export async function updateLesson(
    lessonId: string,
    updates: Partial<{ status: string }>,
): Promise<ApiActionResponseModel<LessonData>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("lesson").update(updates).eq("id", lessonId).select().single();

        if (error) {
            return handleSupabaseError(error, "update lesson", "Failed to update lesson");
        }

        logger.info("Updated lesson", { lessonId, updates });
        revalidatePath("/lessons");
        revalidatePath("/classboard");
        return { success: true, data };
    } catch (error) {
        logger.error("Error updating lesson", error);
        return { success: false, error: "Failed to update lesson" };
    }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId: string): Promise<ApiActionResponseModel<null>> {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase.from("lesson").delete().eq("id", lessonId);

        if (error) {
            return handleSupabaseError(error, "delete lesson", "Failed to delete lesson");
        }

        logger.info("Deleted lesson", { lessonId });
        revalidatePath("/lessons");
        revalidatePath("/classboard");
        return { success: true, data: null };
    } catch (error) {
        logger.error("Error deleting lesson", error);
        return { success: false, error: "Failed to delete lesson" };
    }
}

/**
 * Assign teacher and commission to an existing lesson
 * Returns the updated lesson with full relations (teacher, commission, events)
 */
export async function assignTeacherCommissionToLesson(
    lessonId: string,
    teacherId: string,
    commissionId: string,
): Promise<ApiActionResponseModel<any>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School ID not found in headers" };
        }

        const supabase = getServerConnection();

        // Check if this teacher+commission combo already exists in this lesson's booking
        // Get the lesson first to find its booking
        const { data: lesson, error: lessonError } = await supabase.from("lesson").select("booking_id").eq("id", lessonId).single();

        if (lessonError || !lesson) {
            return handleSupabaseError(lessonError, "fetch lesson for assignment", "Lesson not found");
        }

        // Check for duplicate combo in same booking
        const { data: duplicateCheck, error: duplicateError } = await supabase
            .from("lesson")
            .select("id")
            .eq("booking_id", lesson.booking_id)
            .eq("teacher_id", teacherId)
            .eq("commission_id", commissionId)
            .neq("id", lessonId)
            .single();

        if (duplicateCheck && !duplicateError) {
            return { success: false, error: "This teacher+commission is already assigned to this booking" };
        }

        // Update the lesson
        const { data: updatedLesson, error: updateError } = await supabase
            .from("lesson")
            .update({
                teacher_id: teacherId,
                commission_id: commissionId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", lessonId)
            .select(
                `
        *,
        teacher:teacher_id (
          id,
          username,
          first_name,
          last_name,
          passport,
          country,
          phone,
          languages,
          active
        ),
        commission:commission_id (
          id,
          commission_type,
          cph,
          description
        ),
        event (
          id,
          date,
          duration,
          status,
          created_at
        )
      `,
            )
            .single();

        if (updateError || !updatedLesson) {
            return handleSupabaseError(updateError, "assign teacher to lesson", "Failed to assign teacher");
        }

        logger.info("Assigned teacher to lesson", { lessonId, teacherId, commissionId, bookingId: lesson.booking_id });
        revalidatePath("/classboard");
        revalidatePath(`/bookings/${lesson.booking_id}`);
        revalidatePath(`/teachers/${teacherId}`);

        return { success: true, data: updatedLesson };
    } catch (error) {
        logger.error("Error assigning teacher to lesson", error);
        return { success: false, error: "Failed to assign teacher" };
    }
}
