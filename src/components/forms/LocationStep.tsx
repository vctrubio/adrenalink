"use client";

import { useState, useRef, useCallback } from "react";
import { FormField, FormInput } from "@/src/components/ui/form";
import { CountryFlagPhoneSubForm } from "./CountryFlagPhoneSubForm";

interface GooglePlace {
    place_id: string;
    description: string;
    structured_formatting?: {
        main_text: string;
        secondary_text: string;
    };
    terms?: Array<{
        offset: number;
        value: string;
    }>;
}

interface LocationStepProps {
    country: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    city?: string;
    countryError?: string;
    phoneError?: string;
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    onLocationChange: (location: {
        latitude?: number;
        longitude?: number;
        googlePlaceId?: string;
        city?: string;
    }) => void;
    triggerPhoneClear: () => void;
}

export function LocationStep({
    country,
    phone,
    latitude,
    longitude,
    googlePlaceId,
    city,
    countryError,
    phoneError,
    onCountryChange,
    onPhoneChange,
    onLocationChange,
    triggerPhoneClear,
}: LocationStepProps) {
    const [googlePlaces, setGooglePlaces] = useState<GooglePlace[]>([]);
    const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [searchValue, setSearchValue] = useState("");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const searchPlaces = useCallback(async (query: string) => {
        console.log("🔍 Search places called with query:", query);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 3) {
            console.log("ℹ️ Query too short:", query.length);
            setGooglePlaces([]);
            return;
        }

        console.log("⏳ Starting places search for:", query);
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearchingPlaces(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                if (!apiKey) {
                    console.error("❌ API key not found");
                    setIsSearchingPlaces(false);
                    return;
                }

                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&types=establishment|geocode`;
                console.log("📡 Making HTTP API request to:", url.replace(apiKey, "API_KEY_HIDDEN"));

                // Use a proxy endpoint to avoid CORS issues
                const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
                const data = await response.json();

                console.log("📨 API Response:", data);
                
                if (data.status === "OK" && data.predictions) {
                    console.log("✅ Places found:", data.predictions.slice(0, 5));
                    setGooglePlaces(data.predictions.slice(0, 5));
                } else {
                    console.log("❌ No places found or API error. Status:", data.status);
                    setGooglePlaces([]);
                }
            } catch (error) {
                console.error("❌ Error searching places:", error);
                setGooglePlaces([]);
            } finally {
                setIsSearchingPlaces(false);
            }
        }, 300);
    }, []);

    const selectPlace = useCallback(async (place: GooglePlace) => {
        try {
            console.log("📍 Selecting place:", place.place_id);
            
            const response = await fetch(`/api/places/details?place_id=${place.place_id}`);
            const data = await response.json();

            console.log("📨 Place details response:", data);

            if (data.status === "OK" && data.result) {
                const result = data.result;
                setSelectedPlace(result);
                
                const cityComponent = result.address_components?.find(
                    (component: any) => component.types.includes("locality") || component.types.includes("administrative_area_level_1")
                );
                
                onLocationChange({
                    googlePlaceId: place.place_id,
                    latitude: result.geometry?.location?.lat,
                    longitude: result.geometry?.location?.lng,
                    city: cityComponent?.long_name,
                });
                
                setGooglePlaces([]);
                setSearchValue(result.formatted_address || place.description);
                console.log("✅ Place selected successfully");
            } else {
                console.error("❌ Failed to get place details:", data.status);
            }
        } catch (error) {
            console.error("❌ Error selecting place:", error);
        }
    }, [onLocationChange]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        searchPlaces(value);
    }, [searchPlaces]);

    return (
        <div className="space-y-6">
            <CountryFlagPhoneSubForm
                onCountryChange={onCountryChange}
                onPhoneChange={onPhoneChange}
                countryValue={country}
                countryError={countryError}
                phoneError={phoneError}
                onClearPhone={triggerPhoneClear}
                countryIsValid={!countryError && !!country}
                phoneIsValid={!phoneError && !!phone && phone.replace(/\D/g, "").length >= 9}
            />

            <FormField label="Search Location">
                <div className="relative">
                    <FormInput
                        type="text"
                        placeholder="Search for your school location..."
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                    {isSearchingPlaces && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {googlePlaces.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {googlePlaces.map((place) => (
                                <button
                                    key={place.place_id}
                                    type="button"
                                    onClick={() => selectPlace(place)}
                                    className="w-full text-left px-4 py-3 hover:bg-accent border-b border-border last:border-b-0"
                                >
                                    <div className="font-medium">
                                        {place.structured_formatting?.main_text || place.terms?.[0]?.value || place.description}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {place.structured_formatting?.secondary_text || place.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </FormField>

            {selectedPlace && (
                <div className="p-4 bg-accent/20 border border-accent rounded-md">
                    <h4 className="font-medium mb-2">Selected Location:</h4>
                    <div className="text-sm space-y-1">
                        <div><strong>Address:</strong> {selectedPlace.formatted_address}</div>
                        {latitude && <div><strong>Latitude:</strong> {latitude.toFixed(6)}</div>}
                        {longitude && <div><strong>Longitude:</strong> {longitude.toFixed(6)}</div>}
                        {googlePlaceId && <div><strong>Place ID:</strong> {googlePlaceId}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}