"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { useSearch } from "@/src/providers/search-provider";

export const NavLeft = () => {
    const { onOpen } = useSearch();

    return (
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <AdranlinkIcon size={40} className="text-primary" />
            </Link>
            <div className="relative" onClick={onOpen}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Search Adrenalink..."
                    className="h-9 w-full rounded-full bg-muted pl-10 pr-4 text-sm focus:outline-none cursor-pointer"
                    readOnly
                />
            </div>
        </div>
    );
};
