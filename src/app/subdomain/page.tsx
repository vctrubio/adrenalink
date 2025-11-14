import { getSchoolSubdomain, getAllSchools } from "@/actions/subdomain-action";
import SchoolSubdomain from "@/src/portals/schools/SchoolDebugSubdomain";
import SchoolHeader from "@/src/app/subdomain/SchoolHeader";
import { PackageFilterView } from "./PackageFilterView";
import { NoSchoolFound } from "./NoSchoolFound";

interface SubdomainPageProps {
    searchParams: Promise<{
        username?: string;
    }>;
}

export default async function SubdomainPage({ searchParams }: SubdomainPageProps) {
    // Get username from middleware context (passed as search param)
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
            // Get all schools for the 404 page
            const schoolsResult = await getAllSchools();
            const schools = schoolsResult.success ? schoolsResult.data || [] : [];
            
            return <NoSchoolFound username={username} schools={schools} />;
        }

        const { school, packages } = result.data;
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
                <SchoolHeader school={school} />
                
                {/* Packages Section - The Pinpoint of Your App */}
                <div className="container mx-auto px-4 py-12">
                    {packages.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-lg">
                                No packages available at this time
                            </p>
                        </div>
                    ) : (
                        <PackageFilterView packages={packages} />
                    )}
                </div>

                {/* <SchoolSubdomain school={school} /> */}
            </div>
        );
        
    } catch (error) {
        console.error("💥 Error in subdomain page:", error);
        return (
            <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Portal Error</h1>
                    <p className="text-xl mb-2">Username: {username}</p>
                    <p className="text-red-300">An error occurred loading this school portal.</p>
                    <pre className="mt-4 text-sm bg-black/50 p-4 rounded">
                        {error instanceof Error ? error.message : String(error)}
                    </pre>
                </div>
            </div>
        );
    }
}