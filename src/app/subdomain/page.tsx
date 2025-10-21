import { getSchoolById } from "@/actions/schools-action";
import SchoolSubdomain from "@/src/portals/SchoolSubdomain";

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
        const result = await getSchoolById(username, true);
        
        if (!result.success) {
            return (
                <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">School Not Found</h1>
                        <p className="text-xl mb-2">Username: {username}</p>
                        <p className="text-red-300">This school does not exist in our system.</p>
                    </div>
                </div>
            );
        }
        
        return <SchoolSubdomain school={result.data} />;
        
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