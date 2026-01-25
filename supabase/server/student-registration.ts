"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { logger } from "@/backend/logger";
import { revalidatePath } from "next/cache";

/**
 * Checks if a Clerk user is already registered as a student in the current school
 * Uses school_students table since it holds the clerk_id mapping
 */
export async function checkStudentSchoolRelation(clerkId: string): Promise<{
    success: boolean;
    data?: {
        student: any;
        schoolStudent: any;
    };
    error?: string;
}> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // 1. Find if this Clerk ID is linked to ANY student record in the system
        // Mapping exists in school_students. We join with student to get profile info.
        const { data: allRelations, error: searchError } = await supabase
            .from("school_students")
            .select(`
                student_id,
                clerk_id,
                school_id,
                email,
                active,
                rental,
                student (*)
            `)
            .eq("clerk_id", clerkId);

        if (searchError) {
            logger.error("Error searching for student by clerk_id", searchError);
            return { success: false, error: "Failed to verify student profile" };
        }

        if (!allRelations || allRelations.length === 0) {
            // No student found with this Clerk ID anywhere
            return { success: true, data: undefined };
        }

        // We found a global identity. Use the profile info from the first relation found.
        const globalProfile = allRelations[0].student;
        const studentId = allRelations[0].student_id;

        // 2. Check if they have a relationship with THIS specific school
        const schoolRelation = allRelations.find(r => r.school_id === schoolHeader.id);

        return { 
            success: true, 
            data: {
                student: globalProfile,
                schoolStudent: schoolRelation || null
            } 
        };
    } catch (error) {
        logger.error("Unexpected error in checkStudentSchoolRelation", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Registers a new student or links an existing profile to the current school
 */
export async function registerStudentForSchool(params: {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    passport: string;
    country: string;
    languages: string[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // 1. Check if ANY relation exists for this clerk_id to find existing student_id
        const { data: existingRelation } = await supabase
            .from("school_students")
            .select("student_id")
            .eq("clerk_id", params.clerkId)
            .maybeSingle();

        let studentId: string;

        if (!existingRelation) {
            // Create new student record (using only standard columns)
            const { data: newStudent, error: createError } = await supabase
                .from("student")
                .insert({
                    first_name: params.firstName,
                    last_name: params.lastName,
                    passport: params.passport,
                    country: params.country,
                    phone: params.phone,
                    languages: params.languages,
                })
                .select()
                .single();

            if (createError) {
                logger.error("Error creating student record", createError);
                return { success: false, error: "Failed to create student profile" };
            }
            studentId = newStudent.id;
        } else {
            // Use existing student_id and update their profile info
            studentId = existingRelation.student_id;
            const { error: updateError } = await supabase
                .from("student")
                .update({
                    first_name: params.firstName,
                    last_name: params.lastName,
                    passport: params.passport,
                    country: params.country,
                    phone: params.phone,
                    languages: params.languages,
                })
                .eq("id", studentId);

            if (updateError) {
                logger.warn("Failed to update student profile info, but continuing", updateError);
            }
        }

        // 2. Create or update the school_students relationship for THIS school
        // This table DEFINITELY has clerk_id and email
        const { error: relationError } = await supabase
            .from("school_students")
            .upsert({
                school_id: schoolHeader.id,
                student_id: studentId,
                clerk_id: params.clerkId,
                email: params.email,
                active: true,
                rental: false, // Default to false
            }, { onConflict: 'school_id, student_id' });

        if (relationError) {
            logger.error("Error creating school_student relation", relationError);
            return { success: false, error: "Failed to link student to school" };
        }

        // Revalidate relevant paths
        revalidatePath("/students");
        revalidatePath(`/student/${studentId}`);

        const { data: finalStudent } = await supabase.from("student").select("*").eq("id", studentId).single();
        return { success: true, data: finalStudent };
    } catch (error) {
        logger.error("Unexpected error in registerStudentForSchool", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}