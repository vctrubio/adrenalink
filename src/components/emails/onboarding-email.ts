import { EMAIL_COLORS } from "@/types/email-colors";

export function buildOnboardingEmailContent(onboardingUrl: string): string {
    return `
        <div class="content">
            <span class="eyebrow">Administration Guide</span>
            <h1 class="h1">Welcome to Adrenalink</h1>
            <p class="lead">This documentation is an <a href="${onboardingUrl}" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: none;"><em>onboarding</em></a> guide for schools looking to register. Our technology empowers students and teachers to easily manage their lessons, payments and more.</p>
            
            <div class="guide-container">
                <div class="guide-item">
                    <div class="guide-number">1</div>
                    <div class="guide-content">
                        <h3 class="guide-title">System Architecture</h3>
                        <ul style="margin: 12px 0 0 0; padding-left: 0; list-style: none; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px; line-height: 1.8;">
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${EMAIL_COLORS.students}; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: ${EMAIL_COLORS.textPrimary};">Students</strong> - Registration & tracking</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${EMAIL_COLORS.teachers}; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: ${EMAIL_COLORS.textPrimary};">Teachers</strong> - Hours & commissions</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${EMAIL_COLORS.bookings}; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: ${EMAIL_COLORS.textPrimary};">Bookings</strong> - Smart scheduling</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${EMAIL_COLORS.equipment}; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: ${EMAIL_COLORS.textPrimary};">Equipment</strong> - Lifecycle management</span>
                            </li>
                            <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${EMAIL_COLORS.packages}; margin-right: 12px; margin-top: 4px; flex-shrink: 0;"></span>
                                <span><strong style="color: ${EMAIL_COLORS.textPrimary};">Packages</strong> - Set your prices</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="guide-item">
                    <div class="guide-number">2</div>
                    <div class="guide-content">
                        <h3 class="guide-title">Know What We've Built</h3>
                        <p class="guide-description">From fast lesson automation, to a full statistic description:</p>
                        <ul style="margin: 12px 0 0 0; padding-left: 20px; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px; line-height: 1.8;">
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
                        <ul style="margin: 12px 0 0 0; padding-left: 20px; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px; line-height: 1.8;">
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
                        <p class="guide-description">Play with real data to start understanding the app... or skip this step and access our <a href="https://dummy_wind.adrenalink.tech/" style="color: ${EMAIL_COLORS.primary}; text-decoration: none;">dummy school.</a></p>
                    </div>
                </div>
            </div>
            
            <div class="btn-container" style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                <a href="${onboardingUrl}" class="btn">Begin the Guide</a>
                <a href="${onboardingUrl}/video" style="background-color: ${EMAIL_COLORS.primaryDark}; color: ${EMAIL_COLORS.white}; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: background-color 0.2s;">Watch the Tutorial</a>
            </div>
        </div>
    `;
}
