"use server";

import type { ApiActionResponseModel } from "@/types/actions";
import { sendOnboardingInvitationEmail } from "./email-service";
import { logger } from "@/backend/logger";

export async function sendOnboardingEmail(recipientEmail: string): Promise<ApiActionResponseModel<void>> {
    try {
        if (!recipientEmail || !recipientEmail.includes("@")) {
            return { success: false, error: "Please provide a valid email address" };
        }

        await sendOnboardingInvitationEmail(recipientEmail);
        
        logger.info("Onboarding email sent", { recipientEmail });
        return { success: true, data: undefined };
    } catch (error) {
        logger.error("Failed to send onboarding email", error);
        return { success: false, error: "Failed to send email. Please try again." };
    }
}
