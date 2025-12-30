import { getSchoolHeader } from "@/types/headers";
import { getClassboardBookings } from "@/actions/classboard-action";
import { HomeExample } from "./HomeExample";

export default async function HomePage() {
    const school = await getSchoolHeader();

    if (!school) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-foreground">Error</h1>
                <p className="text-muted-foreground mt-1">Unable to load school information</p>
            </div>
        );
    }

    console.log("Starting fetch for HomePage...");
    const start = Date.now();
    const result = await getClassboardBookings();
    const duration = Date.now() - start;
    console.log(`Fetch completed in ${duration}ms`);

    const classboardData = result.success && result.data ? result.data : {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome, {school.name}</h1>
                <p className="text-muted-foreground mt-1">Manage your adrenaline sports school</p>
            </div>
            <HomeExample classboardData={classboardData} />
        </div>
    );
}