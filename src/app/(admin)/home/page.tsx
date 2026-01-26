import { getHomeBookings } from "@/supabase/server/home";
import { HomePage } from "./HomePage";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
    const classboardData = await getHomeBookings();
    return <HomePage classboardData={classboardData} />;
}
