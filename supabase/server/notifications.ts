import { School } from "@/supabase/db/types";
import { logger } from "@/backend/logger";

/**
 * Logs a system error.
 */
export async function logAndNotifyError(context: string, error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // System Log (Vercel/Console)
    logger.error(`System error in ${context}`, error);
    if (error instanceof Error && error.stack) {
        logger.error("Error stack trace", { stack: error.stack });
    }
}

/**
 * Logs a new school registration.
 */
export async function logAndNotifyNewSchool(school: School, email: string, reference?: string) {
    // System Log
    logger.info("New school registration", {
        schoolName: school.name,
        username: school.username,
        email,
        country: school.country,
        link: `https://${school.username}.adrenalink.tech`,
        reference,
    });
}
