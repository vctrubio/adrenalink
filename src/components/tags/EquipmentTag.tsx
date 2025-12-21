"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Tag } from "@/src/components/ui/tag/tag";

interface EquipmentTagProps {
    icon: ReactNode;
    model: string;
    size?: number | null;
    link: string;
}

export const EquipmentTag = ({ icon, model, size, link }: EquipmentTagProps) => {
    const displayText = size ? `${model} ${size}` : model;

    return (
        <Link href={link}>
            <Tag icon={icon} name={displayText} />
        </Link>
    );
};
