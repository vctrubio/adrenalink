import { getSchoolSubdomain, getAllSchools } from "@/actions/subdomain-action";
import SchoolSubdomain from "@/src/portals/schools/SchoolDebugSubdomain";
import SchoolHeader from "@/src/app/subdomain/SchoolHeader";
import { PackageFilterView } from "./PackageFilterView";
import { NoSchoolFound } from "./NoSchoolFound";

interface SubdomainContentProps {
    username: string;
    isAdminView?: boolean;
}

export async function SubdomainContentView({ username, isAdminView = false }: SubdomainContentProps) {
    if (!username) {
        return (
            <div className={isAdminView ? "flex items-center justify-center min-h-[60vh]" : "min-h-screen bg-red-900 text-white flex items-center justify-center"}>
                <div className="text-center">
                    <h1 className={isAdminView ? "text-2xl font-bold mb-2" : "text-4xl font-bold mb-4"}>Invalid Subdomain</h1>
                    <p className={isAdminView ? "text-muted-foreground" : "text-red-300"}>No school username was provided.</p>
                </div>
            </div>
        );
    }

    try {
        const result = await getSchoolSubdomain(username);

        if (!result.success) {
            // Distinguish between school not found and DB error
            if (result.error === "School not found") {
                // Get all schools for the 404 page
                const schoolsResult = await getAllSchools();
                const schools = schoolsResult.success ? schoolsResult.data || [] : [];
                return <NoSchoolFound schools={schools} />;
            } else {
                // It was a DB error (like a timeout)
                throw new Error(result.error || "Database connection error");
            }
        }

        if (!result.data) {
            const schoolsResult = await getAllSchools();
            const schools = schoolsResult.success ? schoolsResult.data || [] : [];
            return <NoSchoolFound schools={schools} />;
        }

        const { school, packages } = result.data;

        const contentClass = isAdminView ? "space-y-6" : "min-h-screen bg-gradient-to-br from-background via-background to-accent/5";
        const containerClass = isAdminView ? "" : "container mx-auto px-4 py-12";

        return (
            <div className={contentClass}>
                <SchoolHeader school={school} />

                {/* Packages Section */}
                <div className={containerClass}>
                    {packages.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-lg">No packages available at this time</p>
                        </div>
                    ) : (
                        <PackageFilterView packages={packages} schoolName={school.name} />
                    )}
                </div>

                <SchoolSubdomain school={school} />
            </div>
        );
    } catch (error) {
        console.error("💥 Error in subdomain content:", error);
        
        const containerClass = isAdminView 
            ? "flex items-center justify-center min-h-[60vh]" 
            : "min-h-screen bg-red-900 text-white flex items-center justify-center";

        return (
            <div className={containerClass}>
                <div className="text-center">
                    <h1 className={isAdminView ? "text-2xl font-bold mb-2" : "text-4xl font-bold mb-4"}>Portal Error</h1>
                    <p className={isAdminView ? "text-muted-foreground mb-4" : "text-xl mb-2"}>Username: {username}</p>
                    <p className={isAdminView ? "text-sm text-red-500" : "text-red-300"}>An error occurred loading this school portal.</p>
                    {!isAdminView && (
                        <pre className="mt-4 text-sm bg-black/50 p-4 rounded">{error instanceof Error ? error.message : String(error)}</pre>
                    )}
                </div>
            </div>
        );
    }
}
