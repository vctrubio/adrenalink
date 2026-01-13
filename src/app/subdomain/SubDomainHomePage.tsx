"use client";

import type { SchoolWithPackages } from "@/supabase/server/subdomain";
import { getCurrencySymbol } from "@/supabase/db/currency";
import { SchoolPackageContainer } from "./SchoolPackageContainer";
import { SchoolProfileLayout } from "@/src/components/school/SchoolProfileLayout";

/**
 * Shared layout component for the School Landing Page
 */
export function SubDomainHomePage({ school, packages, assets }: SchoolWithPackages) {
    const {
        id,
        name,
        country,
        phone,
        website_url: websiteUrl,
        instagram_url: instagramUrl,
        currency,
        username,
        status,
    } = school;
    const { bannerUrl, iconUrl } = assets;
    const currencySymbol = getCurrencySymbol(currency);

    return (
        <div className="light min-h-screen h-full bg-[#f8f9fa] flex flex-col items-center p-4 md:p-8 text-zinc-900 overflow-hidden">
            <SchoolProfileLayout
                name={name}
                username={username}
                country={country}
                phone={phone}
                websiteUrl={websiteUrl || undefined}
                instagramUrl={instagramUrl || undefined}
                bannerUrl={bannerUrl}
                iconUrl={iconUrl}
                status={status}
                className="flex-1" // Ensure it takes available space like before
            >
                <SchoolPackageContainer packages={packages} currencySymbol={currencySymbol} schoolId={id} />
            </SchoolProfileLayout>
        </div>
    );
}
