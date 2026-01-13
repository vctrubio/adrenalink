import { School } from "@/supabase/db/types";

/**
 * TODO: Verify domain 'adrenalink.tech' in Resend to allow sending to any recipient.
 * Currently using testing domain restriction (onboarding@resend.dev) which
 * only allows sending to the account owner (vctrubio@gmail.com).
 */

const ADMIN_EMAIL = "vctrubio@gmail.com";

export async function sendSchoolRegistrationEmail(school: School, ownerEmail: string) {
    const emailApiUrl = process.env.EMAIL_API_URL;
    const emailApiKey = process.env.EMAIL_API_KEY;

    if (!emailApiUrl) {
        console.warn("⚠️ EMAIL_API_URL not set. Skipping email notification.");
        return;
    }

    const schoolUrl = `https://${school.username}.adrenalink.tech`;
    
    // HTML Template - Premium Adrenalink Branding
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Adrenalink</title>
        <style>
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
            .logo-text { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0; }
            
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
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main">
                <!-- Dark Header -->
                <div class="header">
                    <div class="logo-text">ADR.</div>
                </div>
                
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
                    
                    <div class="quote-box">
                        <div class="quote-text">
                            "Building the home for the adrenaline sports community. We're creating the next generation platform that connects schools, students, and teachers through streamlined operations."
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Adrenalink. All rights reserved.</p>
                <p>
                    <a href="mailto:${ADMIN_EMAIL}" class="footer-link">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        // Domain verified! Sending to actual recipient.
        const response = await fetch(emailApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${emailApiKey || ""}`,
            },
            body: JSON.stringify({
                from: "Adrenalink <onboarding@resend.dev>", // Or use your verified domain e.g. "welcome@adrenalink.tech"
                to: ownerEmail,
                cc: ADMIN_EMAIL,
                subject: `Welcome to Adrenalink: ${school.name}`,
                html: htmlContent,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("❌ Email API Error:", response.status, errorData);
            return;
        }

        const data = await response.json();
        console.log(`📧 Welcome email sent successfully to ${ownerEmail}. ID:`, data.id);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}