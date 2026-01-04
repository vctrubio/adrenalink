import { getSQLClassboardData } from "@/supabase/server/classboard";
import { ClassboardProvider } from "@/src/providers/classboard-provider";
import ClientClassboard from "../ClientClassboard";

export default async function ClassBoardPage() {
    const result = await getSQLClassboardData();

    if (!result.success) {
        return (
            <div className="h-full mx-auto max-w-[2699px] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold mb-2">Class Board Error</h1>
                    <p className="text-red-500">Error: {result.error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full mx-auto max-w-[2699px]">
            <ClassboardProvider initialClassboardModel={result.data}>
                <ClientClassboard />
            </ClassboardProvider>
        </div>
    );
}