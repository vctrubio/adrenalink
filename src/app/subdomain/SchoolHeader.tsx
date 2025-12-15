import Image from "next/image";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import { getSchoolAssets } from "@/getters/cdn-getter";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { AnimatedCanvas } from "@/src/landing/animated-canvas";
import { Globe, Instagram, MapPin, MessageCircle } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

// Style Constants
const BORDER_STYLE = "border-4 border-secondary";
const BANNER_BORDER_STYLE = "border-b-4 border-secondary";
const AVATAR_SIZE = {
    small: "w-32 h-32",
    large: "md:w-40 md:h-40",
};
const ICON_SIZE = {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6",
};
const EQUIPMENT_ICON_SIZE = 16;
const SOCIAL_BUTTON_STYLE = "w-14 h-14 flex items-center justify-center rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all shadow-sm hover:shadow-md";
const STATUS_CONFIG = {
    active: { color: "text-green-500", bgColor: "bg-green-500/10", label: "Active" },
    pending: { color: "text-orange-500", bgColor: "bg-orange-500/10", label: "Pending" },
    closed: { color: "text-red-500", bgColor: "bg-red-500/10", label: "Closed" },
};

interface SchoolHeaderProps {
    school: SchoolModel;
}

// Default Avatar Component
function SchoolDefaultAvatar() {
    return (
        <div className={`relative ${AVATAR_SIZE.small} ${AVATAR_SIZE.large}`}>
            <div className={`w-full h-full rounded-full overflow-hidden shadow-lg ${BORDER_STYLE} flex items-center justify-center`}>
                <AdranlinkIcon className="text-foreground" size={80} />
            </div>
        </div>
    );
}

// School Name Component
function SchoolName({ name }: { name: string }) {
    return (
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
            {name}
        </h1>
    );
}

// Location Info Component
function LocationInfo({ country, timezone, googlePlaceId }: { country: string; timezone?: string | null; googlePlaceId?: string | null }) {
    const content = (
        <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full flex items-center gap-2">
            <MapPin className={ICON_SIZE.small} />
            {country}
            {timezone && ` · ${timezone}`}
        </span>
    );

    if (googlePlaceId) {
        return (
            <div className="flex items-center gap-2">
                <a
                    href={`https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                >
                    {content}
                </a>
            </div>
        );
    }

    return <div className="flex items-center gap-2">{content}</div>;
}

// Status Label Component
function StatusLabel({ status }: { status: "active" | "pending" | "closed" }) {
    const config = STATUS_CONFIG[status];
    return (
        <div className="flex items-center gap-2">
            <span className={`px-3 py-1 ${config.bgColor} ${config.color} text-sm font-medium rounded-full`}>
                {config.label}
            </span>
        </div>
    );
}

// Equipment Categories Component
function EquipmentCategories({ categories }: { categories?: string | null }) {
    if (!categories) return null;

    const categoryList = categories.split(",").map((cat) => cat.trim());

    return (
        <>
            {categoryList.map((categoryId) => {
                const equipmentConfig = EQUIPMENT_CATEGORIES.find((eq) => eq.id === categoryId);
                if (!equipmentConfig) return null;

                const Icon = equipmentConfig.icon;

                return (
                    <div
                        key={categoryId}
                        className="px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium"
                        style={{
                            backgroundColor: `${equipmentConfig.color}15`,
                            color: equipmentConfig.color,
                        }}
                    >
                        <Icon style={{ width: `${EQUIPMENT_ICON_SIZE}px`, height: `${EQUIPMENT_ICON_SIZE}px`, fill: equipmentConfig.color }} />
                        <span>{equipmentConfig.name}</span>
                    </div>
                );
            })}
        </>
    );
}

// Social Links Component
function SocialLinks({
    phone,
    websiteUrl,
    instagramUrl,
}: {
    phone: string;
    websiteUrl?: string | null;
    instagramUrl?: string | null;
}) {
    const whatsappNumber = phone.replace(/\D/g, "");

    return (
        <div className="flex gap-3">
            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={SOCIAL_BUTTON_STYLE}
            >
                <MessageCircle className={ICON_SIZE.large} />
            </a>
            {websiteUrl && (
                <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={SOCIAL_BUTTON_STYLE}
                >
                    <Globe className={ICON_SIZE.large} />
                </a>
            )}
            {instagramUrl && (
                <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={SOCIAL_BUTTON_STYLE}
                >
                    <Instagram className={ICON_SIZE.large} />
                </a>
            )}
        </div>
    );
}


export default async function SchoolHeader({ school }: SchoolHeaderProps) {
    const { bannerUrl } = await getSchoolAssets(school.schema.username);

    return (
        <div className="relative w-full">
            {/* Banner Section with Animated Canvas */}
            <div className={`relative w-full h-48 md:h-64 flex items-center justify-center ${BANNER_BORDER_STYLE}`}>
                {/* Animated Canvas Background */}
                <AnimatedCanvas className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Banner Image - Container */}
                <div className="relative container w-full h-full mx-auto overflow-hidden" style={{ zIndex: 10 }}>
                    <Image
                        src={bannerUrl}
                        alt={`${school.schema.name} banner`}
                        fill
                        className="object-cover"
                        style={{ objectPosition: "center" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
            </div>

            {/* Header Content */}
            <div className="relative bg-background pt-6">
                <div className="container mx-auto px-6">
                    {/* Mobile Layout */}
                    <div className="flex md:hidden flex-col items-center gap-4">
                        {/* Icon - Centered */}
                        <SchoolDefaultAvatar />

                        {/* Name, Status, Location, Equipment - Centered */}
                        <div className="w-full space-y-2 flex flex-col items-center text-center">
                            <SchoolName name={school.schema.name} />
                            <div className="flex flex-wrap gap-2 items-center justify-center">
                                <StatusLabel status={school.schema.status as "active" | "pending" | "closed"} />
                                {school.schema.status === "active" && (
                                    <EquipmentCategories categories={school.schema.equipmentCategories} />
                                )}
                            </div>
                            <LocationInfo
                                country={school.schema.country}
                                timezone={school.schema.timezone}
                                googlePlaceId={school.schema.googlePlaceId}
                            />
                        </div>

                        {/* Social Links - Centered */}
                        <SocialLinks
                            phone={school.schema.phone}
                            websiteUrl={school.schema.websiteUrl}
                            instagramUrl={school.schema.instagramUrl}
                        />
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-start justify-between gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <SchoolDefaultAvatar />
                        </div>

                        {/* Name, Status, Location, and Equipment Info */}
                        <div className="flex-1 space-y-2">
                            <SchoolName name={school.schema.name} />
                            <div className="flex flex-wrap gap-2 items-center">
                                <StatusLabel status={school.schema.status as "active" | "pending" | "closed"} />
                                {school.schema.status === "active" && (
                                    <EquipmentCategories categories={school.schema.equipmentCategories} />
                                )}
                            </div>
                            <LocationInfo
                                country={school.schema.country}
                                timezone={school.schema.timezone}
                                googlePlaceId={school.schema.googlePlaceId}
                            />
                        </div>

                        {/* Social Links */}
                        <div className="flex-shrink-0">
                            <SocialLinks
                                phone={school.schema.phone}
                                websiteUrl={school.schema.websiteUrl}
                                instagramUrl={school.schema.instagramUrl}
                            />
                        </div>
                    </div>

                    {/* Bottom padding */}
                    <div className="pb-6"></div>
                </div>
            </div>
        </div>
    );
}