"use client";

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { SearchInput } from "@/src/components/SearchInput";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";

export function TablesSearchHeader() {
    const pathname = usePathname();
    const controller = useTablesController();
    
    // Determine which entity we are on
    const entity = ENTITY_DATA.find(e => pathname.includes(e.link));
    if (!entity) return null;

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
                <SearchInput
                    id="tables-search-input"
                    entityColor={entity.color}
                    value={controller.search}
                    onChange={(e) => controller.onSearchChange(e.target.value)}
                    placeholder={`Search ${entity.name.toLowerCase()}...`}
                />
            </div>
            
            {/* Future filters can go here */}
        </div>
    );
}
