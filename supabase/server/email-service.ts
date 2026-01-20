import { School } from "@/supabase/db/types";
import { logger } from "@/backend/logger";
import { EMAIL_COLORS } from "@/types/email-colors";
import { buildWelcomeEmailContent } from "@/src/components/emails/welcome-email";
import { buildOnboardingEmailContent } from "@/src/components/emails/onboarding-email";

/**
 * Domain 'adrenalink.tech' is verified in Resend.
 * Sending welcome emails to registered school owners.
 */

const ADMIN_EMAIL = "vctrubio@gmail.com";
const LOGO_URL = "https://adrenalink.tech/ADR.webp";

const EMAIL_STYLES = `
    /* Reset & Base */
    body { margin: 0; padding: 0; background-color: ${EMAIL_COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: ${EMAIL_COLORS.textPrimary}; }
    table { border-spacing: 0; width: 100%; }
    td { padding: 0; }
    img { border: 0; }
    
    /* Container */
    .wrapper { width: 100%; table-layout: fixed; background-color: ${EMAIL_COLORS.background}; padding-bottom: 60px; }
    .main { background-color: ${EMAIL_COLORS.white}; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid ${EMAIL_COLORS.border}; }
    
    /* Header */
    .header { background-color: ${EMAIL_COLORS.primaryDark}; padding: 40px; text-align: center; }
    .logo-img { filter: invert(1) brightness(2) grayscale(1); }
    
    /* Content */
    .content { padding: 40px; }
    .eyebrow { color: ${EMAIL_COLORS.primary}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: block; }
    .h1 { font-size: 32px; font-weight: 800; color: ${EMAIL_COLORS.textPrimary}; margin: 0 0 16px 0; line-height: 1.1; letter-spacing: -0.5px; }
    .lead { font-size: 18px; color: ${EMAIL_COLORS.textSecondary}; line-height: 1.6; margin: 0 0 32px 0; font-weight: 500; }
    
    /* Stats Grid */
    .stats-container { background-color: ${EMAIL_COLORS.backgroundLight}; border: 1px solid ${EMAIL_COLORS.borderLight}; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { font-size: 13px; color: ${EMAIL_COLORS.textMuted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 14px; color: ${EMAIL_COLORS.textPrimary}; font-weight: 700; font-family: 'Courier New', Courier, monospace; }
    
    /* Guide List */
    .guide-container { background-color: ${EMAIL_COLORS.backgroundLight}; border: 1px solid ${EMAIL_COLORS.borderLight}; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .guide-item { display: flex; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; }
    .guide-item:last-child { border-bottom: none; }
    .guide-number { width: 32px; height: 32px; background-color: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.white}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px; }
    .guide-content { flex: 1; }
    .guide-title { font-size: 16px; font-weight: 700; color: ${EMAIL_COLORS.textPrimary}; margin: 0 0 8px 0; }
    .guide-description { font-size: 14px; color: ${EMAIL_COLORS.textSecondary}; line-height: 1.6; margin: 0; }
    
    /* Button */
    .btn-container { text-align: center; margin-bottom: 40px; }
    .btn { background-color: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.white}; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: background-color 0.2s; }
    .btn:hover { background-color: ${EMAIL_COLORS.primaryHover}; }
    
    /* Quote */
    .quote-box { border-left: 4px solid ${EMAIL_COLORS.primary}; padding-left: 20px; margin-top: 40px; }
    .quote-text { font-style: italic; color: ${EMAIL_COLORS.textSecondary}; font-size: 15px; line-height: 1.6; }
    
    /* Footer */
    .footer { background-color: ${EMAIL_COLORS.background}; padding: 24px; text-align: center; color: ${EMAIL_COLORS.textLight}; font-size: 12px; }
    .footer-link { color: ${EMAIL_COLORS.textMuted}; text-decoration: none; font-weight: 500; }
`;

function getEmailHeader(logoUrl: string): string {
    return `
        <div class="header">
            <img src="${logoUrl}" alt="Adrenalink" width="120" class="logo-img" style="display: block; margin: 0 auto; filter: invert(1) brightness(2) grayscale(1);" />
        </div>
    `;
}

function getEmailFooter(): string {
    return "";
}

function getContactFooter(): string {
    return `
        <div style="text-align: center; padding: 40px 20px; color: ${EMAIL_COLORS.textMuted}; font-size: 13px; line-height: 1.8; max-width: 600px; margin: 0 auto;">
            <!-- Links Section -->
            <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid ${EMAIL_COLORS.border};">
                <p style="margin: 0 0 12px 0;">
                    <a href="https://adrenalink.tech" style="color: ${EMAIL_COLORS.primary}; text-decoration: none; font-weight: 600;">Visit Us</a> at <a href="https://adrenalink.tech" style="color: ${EMAIL_COLORS.primary}; text-decoration: none;">adrenalink.tech</a>
                </p>
                <p style="margin: 0 0 12px 0;">
                    <a href="https://adrenalink.tech/discover" style="color: ${EMAIL_COLORS.primary}; text-decoration: none; font-weight: 600;">See Our Schools</a> at <a href="https://adrenalink.tech/discover" style="color: ${EMAIL_COLORS.primary}; text-decoration: none;">adrenalink.tech/discover</a>
                </p>
                <p style="margin: 0;">
                    <a href="https://adrenalink.tech/welcome" style="color: ${EMAIL_COLORS.primary}; text-decoration: none; font-weight: 600;">Register Form</a> at <a href="https://adrenalink.tech/welcome" style="color: ${EMAIL_COLORS.primary}; text-decoration: none;">adrenalink.tech/welcome</a>
                </p>
            </div>
            
            <!-- Contact Section -->
            <div>
                <p style="margin: 0 0 6px 0; color: ${EMAIL_COLORS.textSecondary};">
                    Contact me: <span style="font-weight: 600; color: ${EMAIL_COLORS.textPrimary};">Victor Rubio</span>
                </p>
                <p style="margin: 0 0 12px 0; color: ${EMAIL_COLORS.textSecondary}; font-size: 13px;">Founder, Developer & Instructor.</p>
                <p style="margin: 0;">
                    <a href="mailto:vctrubio@gmail.com" style="color: ${EMAIL_COLORS.textPrimary}; text-decoration: underline; margin-right: 16px;">Email</a>
                    <a href="https://wa.me/+34686516248" style="color: ${EMAIL_COLORS.textPrimary}; text-decoration: underline;">WhatsApp</a>
                </p>
            </div>
        </div>
    `;
}

function buildEmailTemplate(content: string, title: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>${EMAIL_STYLES}</style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main">
                ${getEmailHeader(LOGO_URL)}
                ${content}
            </div>
            ${getContactFooter()}
        </div>
    </body>
    </html>
    `;
}

export async function sendSchoolRegistrationEmail(school: School, ownerEmail: string) {
    const emailApiUrl = process.env.EMAIL_API_URL;
    const emailApiKey = process.env.EMAIL_API_KEY;

    if (!emailApiUrl) {
        logger.warn("EMAIL_API_URL not set. Skipping email notification.");
        return;
    }

    const schoolUrl = `https://${school.username}.adrenalink.tech`;
    const content = buildWelcomeEmailContent(school, ownerEmail, schoolUrl);

    const htmlContent = buildEmailTemplate(content, `Welcome to Adrenalink: ${school.name}`);

    try {
        // Domain verified! Sending to actual recipient.
        const response = await fetch(emailApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${emailApiKey || ""}`,
            },
            body: JSON.stringify({
                from: "Adrenalink <onboarding@adrenalink.tech>",
                to: ownerEmail,
                cc: ADMIN_EMAIL,
                subject: `Welcome to Adrenalink: ${school.name}`,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            logger.error("Email API Error", { status: response.status, errorData });
            return;
        }

        const data = await response.json();
        logger.info("Welcome email sent successfully", { ownerEmail, id: data.id });
    } catch (error) {
        logger.error("Failed to send email", error);
    }
}

export async function sendOnboardingInvitationEmail(recipientEmail: string) {
    const emailApiUrl = process.env.EMAIL_API_URL;
    const emailApiKey = process.env.EMAIL_API_KEY;

    if (!emailApiUrl) {
        logger.warn("EMAIL_API_URL not set. Skipping email notification.");
        return;
    }

    const onboardingUrl = "https://adrenalink.tech/onboarding";
    const content = buildOnboardingEmailContent(onboardingUrl);

    const htmlContent = buildEmailTemplate(content, "Administration Guide");

    try {
        const response = await fetch(emailApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${emailApiKey || ""}`,
            },
            body: JSON.stringify({
                from: "Adrenalink <onboarding@adrenalink.tech>",
                to: recipientEmail,
                cc: ADMIN_EMAIL,
                subject: "Connecting Schools, Students and Teachers",
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            logger.error("Email API Error", { status: response.status, errorData });
            return;
        }

        const data = await response.json();
        logger.info("Onboarding invitation email sent successfully", { recipientEmail, id: data.id });
    } catch (error) {
        logger.error("Failed to send onboarding invitation email", error);
    }
}