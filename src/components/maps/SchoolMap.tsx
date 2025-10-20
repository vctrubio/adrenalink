"use client";

import { useEffect, useRef, useState } from "react";
import type { SchoolType } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

interface SchoolMapProps {
    schools: AbstractModel<SchoolType>[];
}

export function SchoolMap({ schools }: SchoolMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize Google Maps
    useEffect(() => {
        console.log("🗺️ Starting map initialization...");
        
        const initMap = async () => {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            console.log("🔑 API Key available:", !!apiKey);
            
            if (!apiKey) {
                console.error("❌ No API key found");
                setError("Google Maps API key not configured");
                setIsLoading(false);
                return;
            }

            console.log("📍 Checking mapRef.current:", !!mapRef.current);
            if (!mapRef.current) {
                console.log("⏳ Map ref not ready, retrying in 100ms...");
                setTimeout(initMap, 100);
                return;
            }

            try {
                console.log("🔄 Starting Google Maps loading process...");
                
                // Check if Google Maps is already loaded
                const existingScript = document.querySelector("script[src*=\"maps.googleapis.com\"]");
                console.log("📜 Existing script found:", !!existingScript);
                console.log("🌐 window.google available:", !!window.google);
                console.log("🗺️ window.google.maps available:", !!window.google?.maps);

                if (window.google?.maps) {
                    console.log("✅ Google Maps already loaded, creating map instance...");
                    const mapInstance = new google.maps.Map(mapRef.current, {
                        center: { lat: 40.7128, lng: -74.0060 },
                        zoom: 10,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                        ],
                    });
                    console.log("🎉 Map instance created successfully");
                    setMap(mapInstance);
                    setIsLoading(false);
                    return;
                }

                // Load Google Maps script
                console.log("📥 Loading Google Maps script...");
                const script = document.createElement("script");
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps&loading=async`;
                script.async = true;
                script.defer = true;
                
                script.onload = () => {
                    console.log("✅ Google Maps script loaded successfully");
                    try {
                        const mapInstance = new google.maps.Map(mapRef.current!, {
                            center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
                            zoom: 10,
                            styles: [
                                {
                                    featureType: "poi",
                                    elementType: "labels",
                                    stylers: [{ visibility: "off" }],
                                },
                            ],
                        });
                        console.log("🎉 Map instance created successfully");
                        setMap(mapInstance);
                        setIsLoading(false);
                    } catch (mapError) {
                        console.error("❌ Error creating map instance:", mapError);
                        setError("Failed to create map instance");
                        setIsLoading(false);
                    }
                };

                script.onerror = (error) => {
                    console.error("❌ Script loading failed:", error);
                    setError("Failed to load Google Maps");
                    setIsLoading(false);
                };

                // Only add script if not already loading/loaded
                if (!existingScript) {
                    console.log("➕ Adding script to document head...");
                    document.head.appendChild(script);
                } else {
                    console.log("⏳ Script exists but Google Maps not ready, waiting...");
                    // Script exists but not loaded yet, wait and retry
                    setTimeout(initMap, 500);
                }
            } catch (err) {
                console.error("❌ Error in initMap:", err);
                setError("Failed to load Google Maps");
                setIsLoading(false);
            }
        };

        initMap();
    }, []);

    // Update markers when schools change
    useEffect(() => {
        if (!map) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));

        // Filter schools with coordinates
        const schoolsWithCoords = schools.filter(school => 
            school.schema.latitude && school.schema.longitude
        );

        if (schoolsWithCoords.length === 0) {
            setMarkers([]);
            return;
        }

        // Create new markers
        const newMarkers = schoolsWithCoords.map(school => {
            const lat = parseFloat(school.schema.latitude!);
            const lng = parseFloat(school.schema.longitude!);

            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: school.schema.name,
            });

            // Create info window
            const equipmentList = school.schema.equipmentCategories 
                ? JSON.parse(school.schema.equipmentCategories).join(", ")
                : "No equipment listed";

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="p-3 max-w-xs">
                        <h3 class="font-semibold text-lg mb-2">${school.schema.name}</h3>
                        <p class="text-sm text-gray-600 mb-1">
                            <strong>Location:</strong> ${school.schema.city || "City not specified"}, ${school.schema.country}
                        </p>
                        <p class="text-sm text-gray-600 mb-1">
                            <strong>Phone:</strong> ${school.schema.phone}
                        </p>
                        <p class="text-sm text-gray-600 mb-2">
                            <strong>Equipment:</strong> ${equipmentList}
                        </p>
                        <p class="text-sm text-gray-600">
                            <strong>Students:</strong> ${school.lambda?.studentCount || 0}
                        </p>
                    </div>
                `,
            });

            marker.addListener("click", () => {
                infoWindow.open(map, marker);
            });

            return marker;
        });

        setMarkers(newMarkers);

        // Fit map to show all markers
        if (newMarkers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            newMarkers.forEach(marker => {
                bounds.extend(marker.getPosition()!);
            });
            map.fitBounds(bounds);

            // Set maximum zoom level
            const listener = google.maps.event.addListener(map, "idle", () => {
                if (map.getZoom()! > 15) map.setZoom(15);
                google.maps.event.removeListener(listener);
            });
        }
    }, [map, schools]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading map...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="text-center">
                    <p className="text-destructive mb-2">{error}</p>
                    <p className="text-sm text-muted-foreground">
                        Please check your Google Maps API configuration
                    </p>
                </div>
            </div>
        );
    }

    const schoolsWithCoords = schools.filter(school => 
        school.schema.latitude && school.schema.longitude
    );

    return (
        <div className="relative h-full">
            <div ref={mapRef} className="w-full h-full" />
            
            {schools.length > 0 && schoolsWithCoords.length === 0 && (
                <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
                    <div className="text-center p-6">
                        <p className="text-muted-foreground mb-2">
                            No schools have location data to display on the map
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Schools need latitude and longitude coordinates to appear on the map
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}