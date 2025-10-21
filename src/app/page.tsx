import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";
import LandingPage from "@/src/components/Home";

export default async function Home() {
    const result = await getSchools();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <>
            <LandingPage />
            <div className="h-screen flex flex-col">
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-4">
                        {result.data.map((school) => (
                            <SchoolCard key={school.schema.id} school={school} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
