"use client";

import { forwardRef, useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import { COUNTRIES, getCountryByName } from "@/config/countries";

interface FormCountryPhoneProps {
    countryValue: string;
    phoneValue: string;
    onCountryChange: (country: string) => void;
    onPhoneChange: (phone: string) => void;
    countryError?: boolean;
    phoneError?: boolean;
    disabled?: boolean;
}

const FormCountryPhone = forwardRef<HTMLDivElement, FormCountryPhoneProps>(
    ({ countryValue, phoneValue, onCountryChange, onPhoneChange, countryError = false, phoneError = false, disabled = false }, ref) => {
        const selectedCountry = getCountryByName(countryValue);
        const [phoneCode, setPhoneCode] = useState(phoneValue.match(/^\+?\d+/)?.[0] || "");
        const [phoneNumber, setPhoneNumber] = useState(phoneValue.replace(/^\+?\d+\s*/, ""));
        const [codeMismatch, setCodeMismatch] = useState(false);

        // Update phone code when country changes
        useEffect(() => {
            if (selectedCountry) {
                setPhoneCode(selectedCountry.phoneCode);
                setCodeMismatch(false);
            }
        }, [countryValue, selectedCountry]);

        const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const countryName = e.target.value;
            onCountryChange(countryName);
        };

        const handlePhoneCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newCode = e.target.value;
            setPhoneCode(newCode);

            // Check if code matches selected country
            if (selectedCountry) {
                setCodeMismatch(newCode !== selectedCountry.phoneCode);
            }

            // Update full phone
            onPhoneChange(newCode + phoneNumber);
        };

        const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const cleaned = e.target.value.replace(/[^\d\s]/g, "");
            setPhoneNumber(cleaned);
            onPhoneChange(phoneCode + cleaned);
        };

        return (
            <div ref={ref} className="space-y-4">
                {/* Country Select */}
                <div className="space-y-2">
                    <div className="relative">
                        {selectedCountry && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                                <ReactCountryFlag
                                    countryCode={selectedCountry.code}
                                    svg
                                    style={{
                                        width: "1.2em",
                                        height: "1.2em",
                                    }}
                                />
                            </div>
                        )}
                        <select
                            value={countryValue}
                            onChange={handleCountryChange}
                            disabled={disabled}
                            className={`
                                w-full h-10 ${selectedCountry ? "pl-12" : "pl-3"} pr-8 rounded-lg border transition-colors text-sm
                                bg-background text-foreground appearance-none
                                ${countryError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring focus:border-ring"}
                                focus:outline-none focus:ring-2 focus:ring-opacity-50
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <option value="">Select country...</option>
                            {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.name}>
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

                {/* Phone Input */}
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="relative w-20">
                            <input
                                type="text"
                                value={phoneCode}
                                onChange={handlePhoneCodeChange}
                                disabled={disabled}
                                className={`
                                    w-full h-10 px-3 rounded-lg border text-center font-mono text-sm transition-colors
                                    ${
                                        codeMismatch
                                            ? "bg-warning/10 border-warning text-warning"
                                            : "bg-muted border-input text-muted-foreground"
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                                    ${codeMismatch ? "focus:ring-warning" : "focus:ring-ring"}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                title={codeMismatch ? "Phone code doesn't match selected country" : ""}
                            />
                            {codeMismatch && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-warning rounded-full border-2 border-background" />
                            )}
                        </div>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            placeholder="123 456 789"
                            disabled={disabled}
                            className={`
                                flex-1 h-10 px-3 rounded-lg border transition-colors text-sm
                                bg-background text-foreground
                                ${phoneError ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring focus:border-ring"}
                                focus:outline-none focus:ring-2 focus:ring-opacity-50
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />
                    </div>
                </div>
            </div>
        );
    },
);

FormCountryPhone.displayName = "FormCountryPhone";

export default FormCountryPhone;
