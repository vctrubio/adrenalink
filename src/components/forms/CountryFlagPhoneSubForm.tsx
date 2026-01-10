"use client";

import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY_CONFIG, getCountryByCode, getCountryByName } from "@/config/countries";

// Sub-component for Country Selector
function CountrySelector({
    selectedCountryCode,
    onCountryChange,
    countryError,
    isValid,
}: {
    selectedCountryCode: string;
    onCountryChange: (countryCode: string, countryName: string) => void;
    countryError?: string;
    isValid?: boolean;
}) {
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        const country = getCountryByCode(countryCode);
        if (country) {
            onCountryChange(countryCode, country.name);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
                Country
                {!isValid && <span className="text-destructive ml-1">*</span>}
                {isValid && <BadgeCheck className="w-4 h-4 text-secondary ml-1" />}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <ReactCountryFlag
                        countryCode={selectedCountryCode}
                        svg
                        style={{
                            width: "1.2em",
                            height: "1.2em",
                        }}
                    />
                </div>
                <select
                    value={selectedCountryCode}
                    onChange={handleCountryChange}
                    className={`
            w-full h-10 pl-12 pr-8 py-2 rounded-md border transition-colors
            bg-background text-foreground appearance-none
            ${countryError ? "border-black focus:ring-black" : "border-input focus:ring-ring focus:border-ring"}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    <option value="">Select your country...</option>
                    {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Image
                        src="/appSvgs/DropdownBullsIcon.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="text-muted-foreground"
                        style={{
                            filter: "brightness(0) saturate(100%) invert(45%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(60%) contrast(90%)",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

// Sub-component for Phone Input
function PhoneInput({
    phonePrefix,
    phoneNumber,
    isPrefixModified,
    onPrefixChange,
    onNumberChange,
    phoneError,
    isValid,
}: {
    phonePrefix: string;
    phoneNumber: string;
    isPrefixModified: boolean;
    onPrefixChange: (prefix: string) => void;
    onNumberChange: (number: string) => void;
    phoneError?: string;
    isValid?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
                Phone
                {!isValid && <span className="text-destructive ml-1">*</span>}
                {isValid && <BadgeCheck className="w-4 h-4 text-secondary ml-1" />}
            </label>
            <div className="flex">
                <input
                    type="text"
                    value={phonePrefix}
                    onChange={(e) => onPrefixChange(e.target.value)}
                    className={`
            w-20 h-10 px-3 py-2 border border-r-0 rounded-l-md text-center font-mono transition-colors
            ${isPrefixModified ? "bg-warning/10 border-warning text-warning" : "bg-muted border-input text-muted-foreground"}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${isPrefixModified ? "focus:ring-warning" : "focus:ring-ring"}
          `}
                />
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => onNumberChange(e.target.value)}
                    placeholder="123 456 789"
                    className={`
            flex-1 h-10 px-3 py-2 rounded-r-md border transition-colors
            bg-background text-foreground
            ${phoneError ? "border-black focus:ring-black" : "border-input focus:ring-ring focus:border-ring"}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                />
            </div>
        </div>
    );
}

// Main component interface
interface CountryFlagPhoneSubFormProps {
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    countryValue: string;
    countryError?: string;
    phoneError?: string;
    onClearPhone?: () => void;
    countryIsValid?: boolean;
    phoneIsValid?: boolean;
}

// Main component - ONLY RENDERS, logic in sub-components
export function CountryFlagPhoneSubForm({
    onCountryChange,
    onPhoneChange,
    countryValue,
    countryError,
    phoneError,
    onClearPhone,
    countryIsValid,
    phoneIsValid,
    initialPhone,
}: CountryFlagPhoneSubFormProps & { initialPhone?: string }) {
    // Initialize from countryValue or use default
    const initialCountry = countryValue ? getCountryByName(countryValue) : null;
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountry?.code || DEFAULT_COUNTRY_CONFIG.code);
    const [phonePrefix, setPhonePrefix] = useState<string>(initialCountry?.phoneCode || DEFAULT_COUNTRY_CONFIG.phoneCode);
    const [phoneNumber, setPhoneNumber] = useState<string>(initialPhone ? initialPhone.replace(phonePrefix, "") : "");
    const [isPrefixModified, setIsPrefixModified] = useState<boolean>(false);

    // Initialize with Spain as default when component mounts or countryValue becomes empty
    useEffect(() => {
        if (!countryValue) {
            const defaultCountry = getCountryByCode(DEFAULT_COUNTRY_CONFIG.code);
            if (defaultCountry) {
                onCountryChange(defaultCountry.name);
                // Ensure phone is set to prefix at minimum so it's not empty string
                const fullPhone = defaultCountry.phoneCode + phoneNumber;
                onPhoneChange(fullPhone);
            }
        }
    }, []); // Run once on mount to set defaults

    // When form resets and countryValue becomes empty, reset phone only
    useEffect(() => {
        if (!countryValue) {
            setPhoneNumber("");
        }
    }, [countryValue]);

    const handleCountryChange = (countryCode: string, countryName: string) => {
        const country = getCountryByCode(countryCode);
        if (country) {
            setSelectedCountryCode(countryCode);
            setPhonePrefix(country.phoneCode);
            setIsPrefixModified(false);
            onCountryChange(country.name);

            // Update full phone with new prefix
            const fullPhone = country.phoneCode + phoneNumber;
            onPhoneChange(fullPhone);
        }
    };

    const handlePrefixChange = (prefix: string) => {
        setPhonePrefix(prefix);

        // Check if prefix matches the selected country's actual prefix
        const selectedCountry = getCountryByCode(selectedCountryCode);
        const isModified = selectedCountry ? prefix !== selectedCountry.phoneCode : true;
        setIsPrefixModified(isModified);

        const fullPhone = prefix + phoneNumber;
        onPhoneChange(fullPhone);
    };

    const handleNumberChange = (number: string) => {
        // Only allow numbers and spaces
        const cleanedNumber = number.replace(/[^\d\s]/g, "");
        setPhoneNumber(cleanedNumber);

        const fullPhone = phonePrefix + cleanedNumber;
        onPhoneChange(fullPhone);
    };

    // PARENT COMPONENT - ONLY RENDERS
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="shrink-0">
                    <CountrySelector
                        selectedCountryCode={selectedCountryCode}
                        onCountryChange={handleCountryChange}
                        countryError={countryError}
                        isValid={countryIsValid}
                    />
                </div>
                <div className="flex-1">
                    <PhoneInput
                        phonePrefix={phonePrefix}
                        phoneNumber={phoneNumber}
                        isPrefixModified={isPrefixModified}
                        onPrefixChange={handlePrefixChange}
                        onNumberChange={handleNumberChange}
                        phoneError={phoneError}
                        isValid={phoneIsValid}
                    />
                </div>
            </div>
        </div>
    );
}
