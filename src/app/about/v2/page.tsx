"use client";

import { LandingDescription } from "@/src/landing/landing-description";
import { DevAboutMeFooter } from "@/src/landing/landing-footer";

export default function AboutV2Page() {
    return (
        <main className="snap-y snap-mandatory h-screen overflow-y-auto">
            <LandingDescription />
            <DevAboutMeFooter />
        </main>
    );
}
