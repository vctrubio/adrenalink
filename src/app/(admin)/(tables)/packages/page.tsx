import { getPackagesTable } from "@/supabase/server/packages";
import { PackagesTable } from "./PackagesTable";

export default async function PackagesMasterTablePage() {
    const packages = await getPackagesTable();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Packages Master Table</h1>
                <p className="text-muted-foreground">Manage school packages, lesson pricing, and student capacity.</p>
            </div>
            
            <PackagesTable packages={packages} />
        </div>
    );
}
