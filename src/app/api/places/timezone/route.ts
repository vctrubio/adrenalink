import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!lat || !lng) {
            return NextResponse.json({ error: "lat and lng parameters are required" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;

        console.log("🔗 Proxying timezone request to Google Maps API:", url.replace(apiKey, "API_KEY_HIDDEN"));

        const response = await fetch(url);
        const data = await response.json();

        console.log("📨 Google Timezone API Response:", JSON.stringify(data, null, 2));

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error in timezone proxy:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
