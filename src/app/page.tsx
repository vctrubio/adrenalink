import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";
import { LandingPage } from "@/src/landing/landing-page";
import Link from "next/link";

export default async function Home() {
    const result = await getSchools();

    if (!result.success) {
        return <>{result.error}</>;
    }

    console.log("result.data", result.data);
    return (
        <>
            <LandingPage />
            <div>
                ---- this break here ---- and count {result.data.length} ----
                <Link href="/welcome" className="text-forest-400 underline ml-8">
                    Sign Up Now
                </Link>
                {result.data.map((school) => (
                    <SchoolCard key={school.schema.id} school={school} />
                ))}
            </div>
        </>
    );
}
