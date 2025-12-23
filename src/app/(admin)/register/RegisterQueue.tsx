"use client";

import { memo, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRegisterQueues } from "./RegisterContext";
import { ENTITY_DATA } from "@/config/entities";

function RegisterQueueComponent() {
    const queues = useRegisterQueues();

    const renderQueueItem = useCallback((item: any) => {
        const getEntityConfig = (entityId: string) => {
            return ENTITY_DATA.find(e => e.id === entityId);
        };

        const QueueTag = memo(({ href, icon, name, entity }: any) => (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
            >
                <Link
                    href={href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                    style={{
                        backgroundColor: `${entity.bgColor}20`,
                        borderColor: entity.bgColor,
                        color: entity.color,
                        border: `1px solid ${entity.bgColor}`,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${entity.bgColor}30`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${entity.bgColor}20`;
                    }}
                >
                    {icon && <span>{icon}</span>}
                    <span className="text-sm font-medium">{name}</span>
                </Link>
            </motion.div>
        ));

        if (item.type === "student") {
            const StudentIcon = getEntityConfig("student")?.icon;
            const entity = getEntityConfig("student")!;
            return (
                <QueueTag
                    key={item.id}
                    href={`/register?add=student:${item.id}`}
                    icon={StudentIcon ? <StudentIcon size={16} /> : null}
                    name={item.name}
                    entity={entity}
                />
            );
        }

        if (item.type === "teacher") {
            const TeacherIcon = getEntityConfig("teacher")?.icon;
            const entity = getEntityConfig("teacher")!;
            return (
                <QueueTag
                    key={item.id}
                    href={`/register?add=teacher:${item.id}`}
                    icon={TeacherIcon ? <TeacherIcon size={16} /> : null}
                    name={item.name}
                    entity={entity}
                />
            );
        }

        if (item.type === "package") {
            const PackageIcon = getEntityConfig("schoolPackage")?.icon;
            const entity = getEntityConfig("schoolPackage")!;
            return (
                <QueueTag
                    key={item.id}
                    href={`/register?add=package:${item.id}`}
                    icon={PackageIcon ? <PackageIcon size={16} /> : null}
                    name={item.name}
                    entity={entity}
                />
            );
        }

        if (item.type === "booking") {
            const BookingIcon = getEntityConfig("booking")?.icon;
            const entity = getEntityConfig("booking")!;
            return (
                <QueueTag
                    key={item.id}
                    href={`/bookings/${item.id}`}
                    icon={BookingIcon ? <BookingIcon size={16} /> : null}
                    name={item.name}
                    entity={entity}
                />
            );
        }

        return null;
    }, []);

    const memoizedQueueItems = useMemo(() => {
        return Object.values(queues).flat().map((item) => renderQueueItem(item));
    }, [queues, renderQueueItem]);

    // Check if any queues have items
    const hasQueueItems = Object.values(queues).some((items) => items.length > 0);

    if (!hasQueueItems) return null;

    return (
        <motion.div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Recently Added</h3>
            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {memoizedQueueItems}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default memo(RegisterQueueComponent);
