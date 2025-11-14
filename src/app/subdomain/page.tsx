import { SubDomainHomePage } from "./SubDomainHomePage";

interface SubdomainPageProps {
    searchParams: Promise<{
        username?: string;
    }>;
}

export default async function SubdomainPage({ searchParams }: SubdomainPageProps) {
    // Get username from middleware context (passed as search param)
    const params = await searchParams;
    const username = params.username;

    return <SubDomainHomePage username={username || ""} />;
}
