import { getSchoolHeader } from "@/types/headers";
import { getClassboardBookings } from "@/actions/classboard-action";
import { getSchoolCredentials } from "@/src/components/NavAdrBarIconsServer";
import { HomePage as HomeClient } from "./HomePage";

export default async function AdminHomePage() {
    const school = await getSchoolHeader();

    if (!school) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-foreground">Error</h1>
                <p className="text-muted-foreground mt-1">Unable to load school information</p>
            </div>
        );
    }

    const credentials = await getSchoolCredentials();

    console.log("Starting fetch for HomePage...");
    const start = Date.now();
    const result = await getClassboardBookings();
    const duration = Date.now() - start;
    console.log(`Fetch completed in ${duration}ms`);

    const classboardData = result.success && result.data ? result.data : {};

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <HomeClient 
                classboardData={classboardData} 
                school={{
                    name: credentials?.name || school.name,
                    username: credentials?.username || school.username,
                    country: credentials?.country || "",
                    timezone: credentials?.timezone || null,
                    currency: credentials?.currency || "EUR",
                }}
            />
        </div>
    );
}