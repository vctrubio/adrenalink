import Image from "next/image";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import { getSchoolAssets } from "@/getters/cdn-getter";

interface SchoolHeaderProps {
    school: SchoolModel;
}

// Avatar Component
function SchoolAvatar({ iconUrl, name }: { iconUrl: string; name: string }) {
    return (
        <div className="relative -mt-16 md:-mt-20">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg">
                <Image
                    src={iconUrl}
                    alt={`${name} avatar`}
                    fill
                    className="object-cover"
                />
            </div>
        </div>
    );
}

// School Name Component
function SchoolName({ name }: { name: string }) {
    return (
        <h1 className="text-4xl md:text-5xl font-serif font-black text-foreground tracking-tight">
            {name}
        </h1>
    );
}

// School Categories Component
function SchoolCategories({ categories }: { categories?: string }) {
    if (!categories) return null;
    
    return (
        <div className="flex flex-wrap gap-2">
            {categories.split(",").map((category, index) => (
                <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full capitalize"
                >
                    {category.trim()}
                </span>
            ))}
        </div>
    );
}


export default async function SchoolHeader({ school }: SchoolHeaderProps) {
    const { iconUrl, bannerUrl } = await getSchoolAssets(school.schema.username);

    return (
        <div className="relative w-full">
            {/* Banner Image */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden bg-muted">
                <Image
                    src={bannerUrl}
                    alt={`${school.schema.name} banner`}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Header Content */}
            <div className="relative bg-background">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 pb-6">
                        <SchoolAvatar iconUrl={iconUrl} name={school.schema.name} />
                        
                        <div className="flex-1 min-w-0 pt-4 md:pt-0 space-y-3">
                            <SchoolName name={school.schema.name} />
                            <SchoolCategories categories={school.schema.equipmentCategories} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}