"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { History, RefreshCw } from "lucide-react";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { useRegisterActions, useRegisterQueues } from "./RegisterContext";

function RegisterQueueComponent() {
    const queues = useRegisterQueues();
    const { clearQueue } = useRegisterActions();
    const pathname = usePathname();

    const queueItems = useMemo(() => {
        if (!queues) return [];
        const allItems = Object.values(queues)
            .flat()
            .sort((a, b) => b.timestamp - a.timestamp);
        return allItems.slice(0, 6); // Show max 6 items
    }, [queues]);

    if (queueItems.length === 0) return null;

    return (
        <div className="space-y-2 py-2">
            <div className="flex items-center justify-between px-1 opacity-70">
                <div className="flex items-center gap-1.5">
                    <History size={12} className="text-primary" />
                    <h3 className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Recently Added</h3>
                </div>
                <button 
                    onClick={clearQueue}
                    className="p-1 hover:bg-muted rounded-md transition-colors group"
                    title="Clear history"
                >
                    <RefreshCw size={10} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
            </div>

            <div className="border-t border-b border-border/40 divide-y divide-border/40">
                <AnimatePresence initial={false}>
                    {queueItems.map((item) => (
                        <QueueItem key={`${item.type}-${item.id}`} item={item} pathname={pathname} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function QueueItem({ item, pathname }: { item: any; pathname: string }) {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const { selectFromQueue } = useRegisterActions();
    const entityId = item.type === "package" ? "schoolPackage" : item.type;
    const entityConfig = ENTITY_DATA.find((e) => e.id === entityId);

    let Icon = null;

    switch (item.type) {
        case "student":
            Icon = HelmetIcon;
            break;
        case "teacher":
            Icon = HeadsetIcon;
            break;
        case "package":
            Icon = PackageIcon;
            break;
        case "booking":
            Icon = BookingIcon;
            break;
    }

    if (!Icon) return null;

    const handleClick = () => {
        if (item.type === "booking") return; 
        selectFromQueue(item);
        
        // Internal navigation: Take user to the register route to see the selection if they aren't there
        if (pathname !== "/register") {
            router.push("/register", { scroll: false });
        }
    };

    const content = (
        <div className="flex items-center gap-3">
            <div style={{ color: entityConfig?.color }} className="opacity-80 group-hover:opacity-100 transition-opacity">
                <Icon size={14} />
            </div>
            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[180px]">
                {item.name}
            </span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
        >
            {item.type === "booking" ? (
                <Link
                    href={`/bookings/${item.id}`}
                    className="flex items-center justify-between py-2.5 group transition-colors hover:bg-muted/30 px-1 -mx-1"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {content}
                    <GoToAdranlink
                        size={14}
                        isHovered={isHovered}
                        className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                    />
                </Link>
            ) : (
                <button
                    onClick={handleClick}
                    className="w-full flex items-center justify-between py-2.5 group transition-colors hover:bg-muted/30 px-1 -mx-1 text-left"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {content}
                    <GoToAdranlink
                        onClick={handleClick}
                        size={14}
                        isHovered={isHovered}
                        className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                    />
                </button>
            )}
        </motion.div>
    );
}

export default memo(RegisterQueueComponent);
