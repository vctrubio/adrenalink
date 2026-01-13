import { School } from "@/supabase/db/types";

/**
 * Logs a system error.
 */
export async function logAndNotifyError(context: string, error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // System Log (Vercel/Console)
    console.error(`🚨 [SYSTEM ERROR] [${context}]`, errorMessage);
    if (error instanceof Error && error.stack) {
        console.error(error.stack);
    }
}

/**
 * Logs a new school registration.
 */
export async function logAndNotifyNewSchool(school: School, email: string, reference?: string) {
    // System Log
    console.log(`🎉 [New Registration] School: ${school.name} (${school.username})`);
    console.log(`   Email: ${email}`);
    console.log(`   Country: ${school.country}`);
    console.log(`   Link: https://${school.username}.adrenalink.tech`);
    if (reference) {
        console.log(`   Ref: ${reference}`);
    }
}
