"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRegisterQueues } from "./RegisterContext";
import { ENTITY_DATA } from "@/config/entities";
import { History } from "lucide-react";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";

function RegisterQueueComponent() {
    const queues = useRegisterQueues();

    const queueItems = useMemo(() => {
        const allItems = Object.values(queues)
            .flat()
            .sort((a, b) => b.timestamp - a.timestamp);
        return allItems.slice(0, 6); // Show max 3 items to save space
    }, [queues]);

    if (queueItems.length === 0) return null;

    return (
        <div className="space-y-2 py-2">
            <div className="flex items-center gap-1.5 px-1 opacity-70">
                <History size={12} className="text-primary" />
                <h3 className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Recently Added</h3>
            </div>

            <div className="border-t border-b border-border/40 divide-y divide-border/40">
                <AnimatePresence initial={false}>
                    {queueItems.map((item) => (
                        <QueueItem key={item.id} item={item} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function QueueItem({ item }: { item: any }) {
    const [isHovered, setIsHovered] = useState(false);
    const entityId = item.type === "package" ? "schoolPackage" : item.type;
    const entityConfig = ENTITY_DATA.find((e) => e.id === entityId);

    let Icon = null;
    let href = "";

    switch (item.type) {
        case "student":
            Icon = HelmetIcon;
            href = `/register?add=student:${item.id}`;
            break;
        case "teacher":
            Icon = HeadsetIcon;
            href = `/register?add=teacher:${item.id}`;
            break;
        case "package":
            Icon = PackageIcon;
            href = `/register?add=package:${item.id}`;
            break;
        case "booking":
            Icon = BookingIcon;
            href = `/bookings/${item.id}`;
            break;
    }

    if (!Icon) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
        >
            <Link
                href={href}
                className="flex items-center justify-between py-2.5 group transition-colors hover:bg-muted/30 px-1 -mx-1"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center gap-3">
                    <div style={{ color: entityConfig?.color }} className="opacity-80 group-hover:opacity-100 transition-opacity">
                        <Icon size={14} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[180px]">
                        {item.name}
                    </span>
                </div>

                <GoToAdranlink
                    size={14}
                    isHovered={isHovered}
                    className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                />
            </Link>
        </motion.div>
    );
}

export default memo(RegisterQueueComponent);
