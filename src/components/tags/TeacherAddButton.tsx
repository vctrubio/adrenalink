"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@/src/components/ui/tag/tag";
import UrlIcon from "@/public/appSvgs/UrlIcon";
import { Dropdown } from "@/src/components/ui/dropdown";
import { DropdownItemProps } from "@/src/components/ui/dropdown";
import { TeacherModel } from "@/backend/models";

interface TeacherAddButtonProps {
    teacher: TeacherModel;
    color: string;
}

export const TeacherAddButton = ({ teacher, color }: TeacherAddButtonProps) => {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const commissions = teacher.relations?.commissions || [];

    // If 0 or 1 commission, act as a normal link
    const hasMultipleCommissions = commissions.length > 1;

    const handleClick = (e: React.MouseEvent) => {
        if (hasMultipleCommissions) {
            e.preventDefault();
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            // Default behavior handled by Link in Tag if provided,
            // but we need to construct the link here if we are not passing it to Tag
            router.push(`/register?add=teacher:${teacher.schema.id}`);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const dropdownItems: DropdownItemProps[] = commissions.map((commission: any) => ({
        id: commission.id,
        label:
            commission.commissionType === "fixed"
                ? `€${commission.commissionValue}/hour (Fixed)`
                : `${commission.commissionValue}% (Percentage)`,
        icon: () => <div className="w-2 h-2 rounded-full bg-primary" />, // Simple dot icon
        onClick: () => {
            router.push(`/register?add=teacher:${teacher.schema.id}:${commission.id}`);
            setIsDropdownOpen(false);
        },
    }));

    return (
        <div className="relative inline-block" ref={containerRef}>
            <div onClick={handleClick} className="cursor-pointer">
                <Tag
                    icon={<UrlIcon className="w-3 h-3" />}
                    name="Add"
                    bgColor="#e5e7eb"
                    borderColorHex={color}
                    color="#4b5563"
                    // Only provide link if single commission (or none), otherwise we handle click
                    link={!hasMultipleCommissions ? `/register?add=teacher:${teacher.schema.id}` : undefined}
                />
            </div>

            {hasMultipleCommissions && (
                <Dropdown
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    items={dropdownItems}
                    align="left"
                    className="w-56"
                />
            )}
        </div>
    );
};
