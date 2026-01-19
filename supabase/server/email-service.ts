import { School } from "@/supabase/db/types";
import { logger } from "@/backend/logger";

/**
 * Domain 'adrenalink.tech' is verified in Resend.
 * Sending welcome emails to registered school owners.
 */

const ADMIN_EMAIL = "vctrubio@gmail.com";
const LOGO_URL = "https://adrenalink.tech/ADR.webp";

const EMAIL_STYLES = `
    /* Reset & Base */
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #18181b; }
    table { border-spacing: 0; width: 100%; }
    td { padding: 0; }
    img { border: 0; }
    
    /* Container */
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f5; padding-bottom: 60px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #e4e4e7; }
    
    /* Header */
    .header { background-color: #18181b; padding: 40px; text-align: center; }
    .logo-img { filter: invert(1) brightness(2) grayscale(1); }
    
    /* Content */
    .content { padding: 40px; }
    .eyebrow { color: #6366f1; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: block; }
    .h1 { font-size: 32px; font-weight: 800; color: #18181b; margin: 0 0 16px 0; line-height: 1.1; letter-spacing: -0.5px; }
    .lead { font-size: 18px; color: #52525b; line-height: 1.6; margin: 0 0 32px 0; font-weight: 500; }
    
    /* Stats Grid */
    .stats-container { background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e4e4e7; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { font-size: 13px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 14px; color: #18181b; font-weight: 700; font-family: 'Courier New', Courier, monospace; }
    
    /* Guide List */
    .guide-container { background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .guide-item { display: flex; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid #e4e4e7; }
    .guide-item:last-child { border-bottom: none; }
    .guide-number { width: 32px; height: 32px; background-color: #6366f1; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px; }
    .guide-content { flex: 1; }
    .guide-title { font-size: 16px; font-weight: 700; color: #18181b; margin: 0 0 8px 0; }
    .guide-description { font-size: 14px; color: #52525b; line-height: 1.6; margin: 0; }
    
    /* Button */
    .btn-container { text-align: center; margin-bottom: 40px; }
    .btn { background-color: #6366f1; color: #ffffff; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: background-color 0.2s; }
    .btn:hover { background-color: #4f46e5; }
    
    /* Quote */
    .quote-box { border-left: 4px solid #6366f1; padding-left: 20px; margin-top: 40px; }
    .quote-text { font-style: italic; color: #52525b; font-size: 15px; line-height: 1.6; }
    
    /* Footer */
    .footer { background-color: #f4f4f5; padding: 24px; text-align: center; color: #a1a1aa; font-size: 12px; }
    .footer-link { color: #71717a; text-decoration: none; font-weight: 500; }
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
        <div style="text-align: center; padding: 40px 20px; color: #71717a; font-size: 13px; line-height: 1.8; max-width: 600px; margin: 0 auto;">
            <!-- Links Section -->
            <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e4e4e7;">
                <p style="margin: 0 0 12px 0;">
                    <a href="https://adrenalink.tech" style="color: #6366f1; text-decoration: none; font-weight: 600;">Visit Us</a> at <a href="https://adrenalink.tech" style="color: #6366f1; text-decoration: none;">adrenalink.tech</a>
                </p>
                <p style="margin: 0 0 12px 0;">
                    <a href="https://adrenalink.tech/discover" style="color: #6366f1; text-decoration: none; font-weight: 600;">See Our Schools</a> at <a href="https://adrenalink.tech/discover" style="color: #6366f1; text-decoration: none;">adrenalink.tech/discover</a>
                </p>
                <p style="margin: 0;">
                    <a href="https://adrenalink.tech/welcome" style="color: #6366f1; text-decoration: none; font-weight: 600;">Register Forlm</a> at <a href="https://adrenalink.tech/welcome" style="color: #6366f1; text-decoration: none;">adrenalink.tech/welcome</a>
                </p>
            </div>
            
            <!-- Contact Section -->
            <div>
                <p style="margin: 0 0 6px 0; color: #52525b;">
                    Contact me: <span style="font-weight: 600; color: #18181b;">Victor Rubio</span>
                </p>
                <p style="margin: 0 0 12px 0; color: #52525b; font-size: 13px;">Founder, Developer & Instructor.</p>
                <p style="margin: 0;">
                    <a href="mailto:vctrubio@gmail.com" style="color: #18181b; text-decoration: underline; margin-right: 16px;">Email</a>
                    <a href="https://wa.me/+34686516248" style="color: #18181b; text-decoration: underline;">WhatsApp</a>
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
    
    const content = `
        <div class="content">
            <span class="eyebrow">The Adrenalink Connection</span>
            <h1 class="h1">${school.name}</h1>
            <p class="lead">Transparent tracking for both teachers and students. Your platform is ready.</p>
            
            <div class="stats-container">
                <div class="stat-row">
                    <span class="stat-label">Applicant Email</span>
                    <span class="stat-value">${ownerEmail}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Username</span>
                    <span class="stat-value">@${school.username}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Location</span>
                    <span class="stat-value">${school.country}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Currency</span>
                    <span class="stat-value">${school.currency}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Phone</span>
                    <span class="stat-value">${school.phone}</span>
                </div>
            </div>
            
            <div class="btn-container">
                <a href="${schoolUrl}" class="btn">Navigate to Portal</a>
            </div>
        </div>
    `;

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
    const muxPlaybackId = process.env.MUX_ONBOARDING_PLAYBACK_ID || "I0157009OTGhwluo029qpc02ye020152p01J9xDZc1E1fobuxc";
    const muxVideoUrl = `https://player.mux.com/${muxPlaybackId}`;
    const muxThumbnailUrl = `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?width=600&height=338&fit_mode=smart`;
    
    const content = `
        <div class="content">
            <span class="eyebrow">Administration Guide</span>
            <h1 class="h1">Welcome to Adrenalink</h1>
            <p class="lead">This documentation is an <a href="${onboardingUrl}" style="color: #71717a; text-decoration: none;"><em>onboarding</em></a> guide for schools looking to register. Our technology empowers students and teachers to easily manage their lessons, payments and more.</p>
            
            <div class="guide-container">
                <div class="guide-item">
                    <div class="guide-number">1</div>
                    <div class="guide-content">
                        <h3 class="guide-title">System Architecture</h3>
                        <ul style="margin: 12px 0 0 0; padding-left: 0; list-style: none; color: #52525b; font-size: 14px; line-height: 1.8;">
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #eab308; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: #18181b;">Students</strong> - Registration & tracking</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #22c55e; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: #18181b;">Teachers</strong> - Hours & commissions</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #3b82f6; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: #18181b;">Bookings</strong> - Smart scheduling</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #a855f7; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: #18181b;">Equipment</strong> - Lifecycle management</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #fb923c; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: #18181b;">Packages</strong> - Set your prices</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="guide-item">
                    <div class="guide-number">2</div>
                    <div class="guide-content">
                        <h3 class="guide-title">Know What We've Built</h3>
                        <p class="guide-description">From fast lesson automation, to a full statistic description:</p>
                        <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #52525b; font-size: 14px; line-height: 1.8;">
                            <li>Daily</li>
                            <li>Weekly</li>
                            <li>Monthly</li>
                        </ul>
                    </div>
                </div>
                <div class="guide-item">
                    <div class="guide-number">3</div>
                    <div class="guide-content">
                        <h3 class="guide-title">Integrity of the App</h3>
                        <p class="guide-description">Real time synchronisation, accessible everywhere.</p>
                        <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #52525b; font-size: 14px; line-height: 1.8;">
                            <li>Student's reservation status</li>
                            <li>Teacher's lesson activity</li>
                            <li>Booking progress and payments</li>
                        </ul>
                    </div>
                </div>
                <div class="guide-item">
                    <div class="guide-number">4</div>
                    <div class="guide-content">
                        <h3 class="guide-title">Get Started</h3>
                        <p class="guide-description">Play with real data to start understanding the app... or skip this step and access our <a href="https://dummy_wind.adrenalink.tech/" style="color: #6366f1; text-decoration: none;">dummy school.</a></p>
                    </div>
                </div>
            </div>
            
            <div class="btn-container" style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                <a href="${onboardingUrl}" class="btn">Begin the Guide</a>
                <a href="${onboardingUrl}/video" style="background-color: #18181b; color: #ffffff; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: background-color 0.2s;">Watch the Tutorial</a>
            </div>
        </div>
    `;

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