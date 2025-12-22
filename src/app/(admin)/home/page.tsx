import { getSchoolHeader } from "@/types/headers";
import { getHomeEntities } from "@/supabase/server/home";
import { HomeClient } from "./HomeClient";

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

    const entities = await getHomeEntities(school.id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome, {school.name}</h1>
                <p className="text-muted-foreground mt-1">Manage your adrenaline sports school</p>
            </div>
            <HomeClient entities={entities} />
        </div>
    );
}