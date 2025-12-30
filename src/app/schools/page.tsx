import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { getSchoolAssets } from "@/getters/cdn-getter";
import SchoolsClient from "./SchoolsClient";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
    const schoolsData = await db.query.school.findMany({
        columns: {
            name: true,
            username: true,
            country: true,
            equipmentCategories: true,
        },
        where: (school, { inArray }) => inArray(school.status, ["active", "pending"]),
    });

    const schoolsWithAssets = await Promise.all(
        schoolsData.map(async (s) => {
            const assets = await getSchoolAssets(s.username);
            
            // Parse categories: "kite, wing" -> ["kite", "wing"]
            const categories = s.equipmentCategories 
                ? s.equipmentCategories.split(",").map(c => c.trim().toLowerCase())
                : [];

            return {
                name: s.name,
                username: s.username,
                country: s.country,
                categories,
                iconUrl: assets.iconUrl || "/ADR.webp",
                bannerUrl: assets.bannerUrl || "/beach-banner.jpg",
            };
        })
    );

    return <SchoolsClient schools={schoolsWithAssets} />;
}