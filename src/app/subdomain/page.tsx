import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";
import { SubDomainHomePage } from "./SubDomainHomePage";
import { getSchool4Subdomain } from "@/supabase/server/subdomain";

const getSchoolData = cache(async (username: string) => {
    return await getSchool4Subdomain(username);
});

export default async function SubdomainPage() {
    const headersList = await headers();
    const username = headersList.get("x-school-username")!;

    const schoolData = await getSchoolData(username);

    return <SubDomainHomePage {...schoolData!} />;
}

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const username = headersList.get("x-school-username")!;

    const schoolData = await getSchoolData(username);
    const title = schoolData?.school.name || "Adrenalink School";

    return {
        title,
        description: "Home of Adrenaline Activity",
        icons: {
            icon: "/ADR.webp",
            apple: "/ADR.webp",
            shortcut: "/ADR.webp",
        },
        openGraph: {
            title,
            description: "Home of Adrenaline Activity",
            siteName: "Adrenalink",
            images: ["/ADR.webp"],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: "Home of Adrenaline Activity",
            images: ["/ADR.webp"],
        },
    };
}

    