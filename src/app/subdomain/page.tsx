import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SubDomainHomePage } from "./SubDomainHomePage";
import { getSchoolSubdomain } from "@/actions/subdomain-action";

interface SubdomainPageProps {
    searchParams: Promise<{
        username?: string;
    }>;
}

export default async function SubdomainPage({ searchParams }: SubdomainPageProps) {
    const params = await searchParams;
    const username = params.username;

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
    const username = params.username;

    if (!username) {
        return {
            title: "Adrenalink",
            description: "Home of Adrenaline Activity",
            openGraph: {
                title: "Adrenalink",
                description: "Home of Adrenaline Activity",
                siteName: "Adrenalink",
                images: ["/icon/og.svg"],
                type: "website",
            },
        };
    }

    const title = `${username} | Adrenalink School`;

    return {
        title,
        description: "Home of Adrenaline Activity",
        openGraph: {
            title,
            description: "Home of Adrenaline Activity",
            siteName: "Adrenalink",
            images: ["/icon/og.svg"],
            url: `https://adrenalink.tech/subdomain?username=${encodeURIComponent(username)}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: "Home of Adrenaline Activity",
            images: ["/icon/og.svg"],
        },
    };
}