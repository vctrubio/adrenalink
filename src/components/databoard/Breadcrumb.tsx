"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { ArrowLeft } from "lucide-react";

export function Breadcrumb() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    // Extract entity from path: /admin/databoard/students/[id] -> students
    // pathSegments could be: ["admin", "databoard", "students", "[id]"] or similar
    const entityPath = pathSegments.find((segment) => ["students", "teachers", "bookings", "packages", "equipments"].includes(segment));

    // Map path segment to entity id (handle plural to singular)
    const entityIdMap: Record<string, string> = {
        students: "student",
        teachers: "teacher",
        bookings: "booking",
        packages: "schoolPackage",
        equipments: "equipment",
    };

    if (!entityPath) {
        return null;
    }

    const entityId = entityIdMap[entityPath];
    const entity = ENTITY_DATA.find((e) => e.id === entityId);

    if (!entity) {
        return null;
    }

    return (
        <Link
            href={entity.link}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {entity.name}</span>
        </Link>
    );
}
