import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const input = searchParams.get("input");
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!input) {
            return NextResponse.json({ error: "Input parameter is required" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&types=establishment|geocode`;

        console.log("🔗 Proxying request to Google Places API");
        
        const response = await fetch(url);
        const data = await response.json();

        console.log("📨 Google Places API Response Status:", data.status);

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error in places autocomplete proxy:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}