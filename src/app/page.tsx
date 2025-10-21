import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";
import { LandingPage } from "@/src/landing/landing-page";

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
          ---- this break here ---- and count {result.data.length}
          {result.data.map((school) => (
            <SchoolCard key={school.schema.id} school={school} />
          ))}
        </div>
        </>
    );
}
