import { getHomeBookings } from "@/supabase/server/home";
import { HomePage } from "./HomePage";

export default async function AdminHomePage() {
    console.log("📊 Starting fetch for AdminHomePage...");
    const start = Date.now();
    
    const classboardData = await getHomeBookings();
    
    const duration = Date.now() - start;
    console.log(`✅ Fetch completed in ${duration}ms`);
    console.log("📚 ClassboardData entries:", classboardData.length);

    return <HomePage classboardData={classboardData} />;
}
