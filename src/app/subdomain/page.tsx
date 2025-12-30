import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SubDomainHomePage } from "./SubDomainHomePage";
import { getSchoolSubdomain } from "@/actions/subdomain-action";
import { getSchoolHeader } from "@/types/headers";

interface SubdomainPageProps {
    searchParams: Promise<{
        username?: string;
    }>;
}

export default async function SubdomainPage({ searchParams }: SubdomainPageProps) {
    const params = await searchParams;
    let username = params.username;

    // Fallback to header if searchParams is missing (e.g. on subdomains)
    if (!username) {
        const schoolHeader = await getSchoolHeader();
        if (schoolHeader) {
            username = schoolHeader.name;
        }
    }

    if (!username) {
        redirect("/schools");
    }

    try {
        const result = await getSchoolSubdomain(username);

        if (!result.success || !result.data) {
            redirect("/schools");
        }

        const { school, packages, assets } = result.data;

        return <SubDomainHomePage school={school} packages={packages} assets={assets || { iconUrl: null, bannerUrl: null }} />;
    } catch (error) {
        console.error("💥 Error in subdomain content:", error);
        redirect("/schools");
    }
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ username?: string }>;
}): Promise<Metadata> {
    const params = await searchParams;
    let username = params.username;

    // Fallback to header if searchParams is missing (e.g. on subdomains)
    if (!username) {
        const schoolHeader = await getSchoolHeader();
        if (schoolHeader) {
            username = schoolHeader.name;
        }
    }

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

    