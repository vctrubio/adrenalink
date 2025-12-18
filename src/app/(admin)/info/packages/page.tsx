import { getSchoolPackages } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import Link from "next/link";

export default async function PackagesPage() {
    const result = await getSchoolPackages();

    if (!result.success) {
        return (
            <>
                <InfoHeader title="Packages" />
                <div>Error loading packages</div>
            </>
        );
    }

    const packages = result.data;

    return (
        <>
            <InfoHeader title="Packages" />
            <div className="flex flex-col gap-2">
                {packages.map((pkg) => (
                    <Link
                        key={pkg.schema.id}
                        href={`/info/packages/${pkg.schema.id}`}
                        className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h3 className="font-semibold">{pkg.schema.description}</h3>
                    </Link>
                ))}
            </div>
        </>
    );
}
