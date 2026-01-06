import { headers } from "next/headers";
import { getSQLClassboardData } from "@/supabase/server/classboard-old-schema";
import { ClassboardProvider } from "@/src/providers/classboard-provider";
import ClientClassboard from "./ClientClassboard";

export default async function ClassBoardPage() {
    const result = await getSQLClassboardData();
    const headersList = await headers();
    const schoolUsername = headersList.get("x-school-username");

    return (
        <div className="h-full mx-auto max-w-[2699px]">
            <ClassboardProvider
                initialClassboardModel={result.success ? result.data : null}
                serverError={result.success ? null : result.error}
                schoolUsername={schoolUsername}
            >
                <ClientClassboard />
            </ClassboardProvider>
        </div>
    );
}