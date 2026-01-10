import { LandingHero } from "./landing-hero";
import { LandingDescription } from "./landing-description";
import { DevAboutMeFooter } from "./landing-footer";

export function LandingPage() {
    return (
        <div className="flex min-h-screen text-white">
            <main className="flex-1">
                <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
                    <LandingHero />
                    <LandingDescription />
                    <div id="footer" className="snap-start">
                        <DevAboutMeFooter />
                    </div>
                </div>
            </main>
        </div>
    );
}
