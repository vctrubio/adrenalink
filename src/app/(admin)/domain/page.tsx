import { headers } from "next/headers";
import { SubDomainHomePage } from "@/src/app/subdomain/SubDomainHomePage";

export default async function AdminDomainPage() {
    // Get the school username from headers (set by middleware)
    const headersList = await headers();
    const host = headersList.get("host") || "";
    
    // Extract subdomain from host
    const parts = host.split(".");
    const subdomain = parts.length > 2 ? parts[0] : null;

    return <SubDomainHomePage username={subdomain || ""} isAdminView />;
}
