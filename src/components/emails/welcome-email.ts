import { School } from "@/supabase/db/types";
import { EMAIL_COLORS } from "@/types/email-colors";

export function buildWelcomeEmailContent(school: School, ownerEmail: string, schoolUrl: string): string {
    return `
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
}
