"use server";

import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";

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
export async function createLesson(
  lessonData: LessonForm,
): Promise<ApiActionResponseModel<LessonData>> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

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
      console.error("Error creating lesson:", error);
      return { success: false, error: "Failed to create lesson" };
    }

    revalidatePath("/lessons");
    revalidatePath("/classboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error in createLesson:", error);
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
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

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
      console.error("Error creating lesson with commission:", error);
      return { success: false, error: "Failed to create lesson" };
    }

    revalidatePath("/lessons");
    revalidatePath("/classboard");
    revalidatePath(`/bookings/${bookingId}`);
    revalidatePath(`/teachers/${teacherId}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error in createLessonWithCommission:", error);
    return { success: false, error: "Failed to create lesson" };
  }
}

/**
 * Get all lessons
 */
export async function getLessons(): Promise<ApiActionResponseModel<LessonData[]>> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

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
      console.error("Error fetching lessons:", error);
      return { success: false, error: "Failed to fetch lessons" };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getLessons:", error);
    return { success: false, error: "Failed to fetch lessons" };
  }
}

/**
 * Get a lesson by ID
 */
export async function getLessonById(
  lessonId: string,
): Promise<ApiActionResponseModel<LessonData>> {
  try {
    const supabase = getServerConnection();

    const { data, error } = await supabase
      .from("lesson")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (error) {
      console.error("Error fetching lesson:", error);
      return { success: false, error: "Lesson not found" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in getLessonById:", error);
    return { success: false, error: "Failed to fetch lesson" };
  }
}

/**
 * Get lessons by booking ID
 */
export async function getLessonsByBookingId(
  bookingId: string,
): Promise<ApiActionResponseModel<LessonData[]>> {
  try {
    const supabase = getServerConnection();

    const { data, error } = await supabase
      .from("lesson")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lessons by booking:", error);
      return { success: false, error: "Failed to fetch lessons" };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getLessonsByBookingId:", error);
    return { success: false, error: "Failed to fetch lessons" };
  }
}

/**
 * Get lessons by teacher ID
 */
export async function getLessonsByTeacherId(
  teacherId: string,
): Promise<ApiActionResponseModel<LessonData[]>> {
  try {
    const supabase = getServerConnection();

    const { data, error } = await supabase
      .from("lesson")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lessons by teacher:", error);
      return { success: false, error: "Failed to fetch lessons" };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getLessonsByTeacherId:", error);
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

    const { data, error } = await supabase
      .from("lesson")
      .update(updates)
      .eq("id", lessonId)
      .select()
      .single();

    if (error) {
      console.error("Error updating lesson:", error);
      return { success: false, error: "Failed to update lesson" };
    }

    revalidatePath("/lessons");
    revalidatePath("/classboard");
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateLesson:", error);
    return { success: false, error: "Failed to update lesson" };
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(
  lessonId: string,
): Promise<ApiActionResponseModel<null>> {
  try {
    const supabase = getServerConnection();

    const { error } = await supabase
      .from("lesson")
      .delete()
      .eq("id", lessonId);

    if (error) {
      console.error("Error deleting lesson:", error);
      return { success: false, error: "Failed to delete lesson" };
    }

    revalidatePath("/lessons");
    revalidatePath("/classboard");
    return { success: true, data: null };
  } catch (error) {
    console.error("Error in deleteLesson:", error);
    return { success: false, error: "Failed to delete lesson" };
  }
}
