import { getSchools } from "@/supabase/server/schools";
import SchoolsClient from "./SchoolsClient";

export const dynamic = "force-dynamic";

export default async function DiscoverPage(): Promise<React.ReactElement> {
    const schools = await getSchools();

    return <SchoolsClient schools={schools} />;
}
