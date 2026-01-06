import { getHomeBookings } from "@/supabase/server/home";

export default async function AdminHomePage() {
    console.log("📊 Starting fetch for AdminHomePage...");
    const start = Date.now();
    
    const homeData = await getHomeBookings();
    
    const duration = Date.now() - start;
    console.log(`✅ Fetch completed in ${duration}ms`);
    console.log("🏫 School ID:", homeData.schoolId);
    console.log("📚 Bookings count:", homeData.bookings.length);
    console.log("📚 Bookings:", homeData.bookings);

    return <>welcome home admin</>;
}
