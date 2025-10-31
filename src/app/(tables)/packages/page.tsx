import { EntityCard } from "@/src/components/cards/EntityCard";
import PackageCard from "@/src/components/cards/PackageCard";
import { getPackages } from "@/actions/packages-action";

export default async function PackagesPage() {
    const result = await getPackages();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-8 border-b border-border">
                <EntityCard entityId="schoolPackage" count={result.data.length} />
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">{result.data.length === 0 ? <p className="text-muted-foreground">No packages found</p> : result.data.map((schoolPackage) => <PackageCard key={schoolPackage.schema.id} package={schoolPackage} />)}</div>
            </div>
        </div>
    );
}
