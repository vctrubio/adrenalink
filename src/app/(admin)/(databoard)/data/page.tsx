import { getDataboardCounts } from "@/actions/databoard-action";
import { DataDashboardClient } from "./DataDashboardClient";

export default async function DataPage() {
    const result = await getDataboardCounts();

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Data Dashboard</h1>
            <DataDashboardClient counts={result.data} />
        </div>
    );
}
