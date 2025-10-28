"use client";

import { EquipmentSection } from "./EquipmentSection";

export function EquipmentDevPage() {
    return (
        <div>
            <h1 className="text-5xl font-bold text-foreground mb-4">Equipment Ecosystem</h1>
            <p className="text-xl text-muted-foreground mb-8">Explore our equipment categories and their relationships</p>
            <EquipmentSection />
        </div>
    );
}
