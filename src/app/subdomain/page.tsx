import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { SubDomainHomePage } from "./SubDomainHomePage";
import { getSchoolSubdomain } from "@/supabase/server/subdomain";

export default async function SubdomainPage() {
    const headersList = await headers();
    const username = headersList.get("x-school-username");

    if (!username) {
        redirect("/schools");
    }

    let result;
    try {
        result = await getSchoolSubdomain(username);
    } catch (error) {
        console.error("💥 Error fetching subdomain content:", error);
    }

    if (!result?.success || !result?.data) {
        redirect("/schools");
    }

    const { school, packages, assets } = result.data;

    return <SubDomainHomePage school={school} packages={packages} assets={assets || { iconUrl: null, bannerUrl: null }} />;
}

export async function generateMetadata(): Promise<Metadata> {
    const schoolHeader = await getSchoolHeader();
    const username = schoolHeader?.name;

    if (!username) {
        return {
            title: "Adrenalink",
            description: "Home of Adrenaline Activity",
            icons: {
                icon: "/ADR.webp",
                apple: "/ADR.webp",
                shortcut: "/ADR.webp",
            },
            openGraph: {
                title: "Adrenalink",
                description: "Home of Adrenaline Activity",
                siteName: "Adrenalink",
                images: ["/ADR.webp"],
                type: "website",
            },
        };
    }

    const title = `${username} | Adrenalink School`;

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
            url: `https://adrenalink.tech/subdomain?username=${encodeURIComponent(username)}`,
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

    