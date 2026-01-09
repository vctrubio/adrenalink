import { headers } from "next/headers";
import { getSQLClassboardData } from "@/supabase/server/classboard";
import { ClassboardProvider } from "@/src/providers/classboard-provider";
import ClientClassboard from "./ClientClassboard";

export default async function ClassBoardPage() {
    const result = await getSQLClassboardData();

    return (
        <div className="h-full mx-auto max-w-[2699px]">
            <ClassboardProvider
                initialClassboardModel={result.success ? result.data : null}
                serverError={result.success ? null : result.error}
            >
                <ClientClassboard />
            </ClassboardProvider>
        </div>
    );
}