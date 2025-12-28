"use client";

import { SchoolIdentificationCard } from "@/src/portals/SchoolIdentificationCard";

interface School {
    id: string;
    name: string;
    username: string;
    country: string;
    currency: string;
    equipmentCategories: string | null;
    status: string;
}

interface NoSchoolFoundProps {
    schools: School[];
}

export function NoSchoolFound({ schools }: NoSchoolFoundProps) {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Explore Schools</h1>
                    <p className="text-lg text-muted-foreground">
                        The school you were looking for was not found. Browse all available schools below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map((school) => (
                        <SchoolIdentificationCard
                            key={school.id}
                            name={school.name}
                            username={school.username}
                            country={school.country}
                            currency={school.currency}
                            equipmentCategories={school.equipmentCategories}
                        />
                    ))}
                </div>

                {schools.length === 0 && (
                    <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                        No schools available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}
