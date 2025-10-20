import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const placeId = searchParams.get("place_id");
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!placeId) {
            return NextResponse.json({ error: "place_id parameter is required" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
        }

        const fields = "geometry,formatted_address,address_components";
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

        console.log("🔗 Proxying place details request to Google Places API");
        
        const response = await fetch(url);
        const data = await response.json();

        console.log("📨 Google Places Details API Response Status:", data.status);

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error in places details proxy:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}