import { getAllSchools } from "@/actions/subdomain-action";
import SchoolsClient from "./SchoolsClient";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
    const result = await getAllSchools();
    const schools = result.success ? result.data || [] : [];

    return <SchoolsClient schools={schools} />;
}
