import type { Metadata } from "next";
import { SubDomainHomePage } from "./SubDomainHomePage";
import { getSchoolSubdomain, getAllSchools } from "@/actions/subdomain-action";
import { NoSchoolFound } from "./NoSchoolFound";

interface SubdomainPageProps {
    searchParams: Promise<{
        username?: string;
    }>;
}

export default async function SubdomainPage({ searchParams }: SubdomainPageProps) {
    const params = await searchParams;
    const username = params.username;

    if (!username) {
        return (
            <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Invalid Subdomain</h1>
                    <p className="text-red-300">No school username was provided.</p>
                </div>
            </div>
        );
    }

    try {
        const result = await getSchoolSubdomain(username);

        if (!result.success || !result.data) {
            const schoolsResult = await getAllSchools();
            const schools = schoolsResult.success ? schoolsResult.data || [] : [];
            return <NoSchoolFound schools={schools} />;
        }

        const { school, packages, assets } = result.data;

        return <SubDomainHomePage school={school} packages={packages} assets={assets || { iconUrl: null, bannerUrl: null }} />;
    } catch (error) {
        console.error("💥 Error in subdomain content:", error);
        return (
            <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Portal Error</h1>
                    <p className="text-xl mb-2">Username: {username}</p>
                    <p className="text-red-300">An error occurred loading this school portal.</p>
                    <pre className="mt-4 text-sm bg-black/50 p-4 rounded">{error instanceof Error ? error.message : String(error)}</pre>
                </div>
            </div>
        );
    }
}

export async function generateMetadata({
    searchParams,
}: {
    searchParams: { username?: string };
}): Promise<Metadata> {
    const username = searchParams?.username;

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

    const title = `${username} Adrenalink's School`;

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
