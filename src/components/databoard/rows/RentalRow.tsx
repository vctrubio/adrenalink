"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { ENTITY_DATA } from "@/config/entities";
import { RentalStats, getStudentName, getRentalDateString, getRentalLocation, getRentalStatus, getEquipmentInfo } from "@/getters/rentals-getter";
import type { RentalModel } from "@/backend/models";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

interface RentalRowProps {
    item: RentalModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const RentalRow = ({ item: rental, isExpanded, onToggle }: RentalRowProps) => {
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const RentalIcon = rentalEntity.icon;
    const entityColor = rentalEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const studentName = getStudentName(rental);
    const status = getRentalStatus(rental);

    const strItems = [
        { label: "Date", value: getRentalDateString(rental) },
        { label: "Duration (min)", value: RentalStats.getDuration(rental).toString() },
        { label: "Location", value: getRentalLocation(rental) },
    ];

    const equipmentInfo = getEquipmentInfo(rental);
    const EquipmentIcon = equipmentEntity.icon;

    const stats: StatItem[] = [
        { icon: <DurationIcon className="w-5 h-5" />, value: RentalStats.getDuration(rental), label: "Minutes" },
        { icon: <BankIcon className="w-5 h-5" />, value: `$${RentalStats.getRevenue(rental)}`, label: "Revenue" },
    ];

    const RentalAction = () => {
        if (!equipmentInfo) {
            return <div className="text-muted-foreground text-sm">No equipment</div>;
        }

        return (
            <div className="flex items-center gap-2">
                <div style={{ color: equipmentEntity.color }}>
                    <EquipmentIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <div className="text-sm font-medium">{equipmentInfo.sku}</div>
                    <div className="text-xs text-muted-foreground">{equipmentInfo.model}</div>
                </div>
            </div>
        );
    };

    return (
        <Row
            id={rental.schema.id}
            entityData={rental}
            entityBgColor={rentalEntity.bgColor}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <RentalIcon className="w-10 h-10" />
                    </div>
                ),
                name: studentName,
                status,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<RentalAction />}
            stats={stats}
        />
    );
};
