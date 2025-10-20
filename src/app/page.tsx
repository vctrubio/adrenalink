import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import LandingPage from "@/src/components/Home";

export default async function Home() {
    const data: SchoolModel[] | { error: string } = await getSchools();

    if ("error" in data) {
        return <>{data.error}</>;
    }

    return (
        <>
            <LandingPage />
            <div className="h-screen flex flex-col">
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-4">
                        {data.map((school) => (
                            <SchoolCard key={school.schema.id} school={school} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
