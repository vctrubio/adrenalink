"use client";

import { useState, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import Image from "next/image";
import { COUNTRIES, DEFAULT_COUNTRY_CONFIG, getCountryByCode } from "@/config/countries";

// Sub-component for Country Selector
function CountrySelector({
  selectedCountryCode,
  onCountryChange,
  countryError,
}: {
  selectedCountryCode: string;
  onCountryChange: (countryCode: string, countryName: string) => void;
  countryError?: string;
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
      <label className="block text-sm font-medium text-foreground">
        Country <span className="text-destructive">*</span>
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
            ${countryError
              ? "border-destructive focus:ring-destructive"
              : "border-input focus:ring-ring focus:border-ring"
            }
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
              filter:
                "brightness(0) saturate(100%) invert(45%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(60%) contrast(90%)",
            }}
          />
        </div>
      </div>
      {countryError && <p className="text-sm text-destructive">{countryError}</p>}
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
}: {
  phonePrefix: string;
  phoneNumber: string;
  isPrefixModified: boolean;
  onPrefixChange: (prefix: string) => void;
  onNumberChange: (number: string) => void;
  phoneError?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Phone <span className="text-destructive">*</span>
      </label>
      <div className="flex">
        <input
          type="text"
          value={phonePrefix}
          onChange={(e) => onPrefixChange(e.target.value)}
          className={`
            w-20 h-10 px-3 py-2 border border-r-0 rounded-l-md text-center font-mono transition-colors
            ${isPrefixModified
              ? "bg-warning/10 border-warning text-warning"
              : "bg-muted border-input text-muted-foreground"
            }
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
            ${phoneError
              ? "border-destructive focus:ring-destructive"
              : "border-input focus:ring-ring focus:border-ring"
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      </div>
      {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
    </div>
  );
}

// Main component interface
interface CountryFlagPhoneSubFormProps {
  onCountryChange: (country: string) => void;
  onPhoneChange: (phone: string) => void;
  countryValue: string;
  phoneValue: string;
  countryError?: string;
  phoneError?: string;
  onClearPhone?: () => void;
}

// Main component - ONLY RENDERS, logic in sub-components
export function CountryFlagPhoneSubForm({
  onCountryChange,
  onPhoneChange,
  countryValue,
  phoneValue,
  countryError,
  phoneError,
  onClearPhone,
}: CountryFlagPhoneSubFormProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    DEFAULT_COUNTRY_CONFIG.code,
  );
  const [phonePrefix, setPhonePrefix] = useState<string>(DEFAULT_COUNTRY_CONFIG.phoneCode);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isPrefixModified, setIsPrefixModified] = useState<boolean>(false);

  // Initialize with Spain as default
  useEffect(() => {
    if (!countryValue) {
      onCountryChange(DEFAULT_COUNTRY_CONFIG.name);
    }
  }, []);

  // Clear phone number when requested
  useEffect(() => {
    if (onClearPhone) {
      setPhoneNumber("");
      onPhoneChange(phonePrefix);
    }
  }, [onClearPhone]);

  const handleCountryChange = (countryCode: string, countryName: string) => {
    const country = getCountryByCode(countryCode);
    if (country) {
      setSelectedCountryCode(countryCode);
      setPhonePrefix(country.phoneCode);
      setIsPrefixModified(false);
      onCountryChange(countryName);

      // Update full phone with new prefix
      const fullPhone = country.phoneCode + phoneNumber;
      onPhoneChange(fullPhone);
    }
  };

  const handlePrefixChange = (prefix: string) => {
    setPhonePrefix(prefix);
    setIsPrefixModified(true);

    const fullPhone = prefix + phoneNumber;
    onPhoneChange(fullPhone);
  };

  const handleNumberChange = (number: string) => {
    setPhoneNumber(number);

    const fullPhone = phonePrefix + number;
    onPhoneChange(fullPhone);
  };

  // PARENT COMPONENT - ONLY RENDERS
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CountrySelector
        selectedCountryCode={selectedCountryCode}
        onCountryChange={handleCountryChange}
        countryError={countryError}
      />
      <PhoneInput
        phonePrefix={phonePrefix}
        phoneNumber={phoneNumber}
        isPrefixModified={isPrefixModified}
        onPrefixChange={handlePrefixChange}
        onNumberChange={handleNumberChange}
        phoneError={phoneError}
      />
    </div>
  );
}
