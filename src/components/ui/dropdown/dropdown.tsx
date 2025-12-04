"use client";

import { ReactNode } from "react";
import { DropdownItem as DropdownItemComponent, type DropdownItemProps } from "./dropdown-item";

interface DropdownProps {
	isOpen: boolean;
	onClose: () => void;
	items: DropdownItemProps[];
	renderItem?: (item: DropdownItemProps, onClose: () => void) => ReactNode;
	align?: "left" | "right" | "center";
	className?: string;
}

export default function Dropdown({
	isOpen,
	onClose,
	items,
	renderItem,
	align = "right",
	className = "",
}: DropdownProps) {
	if (!isOpen) return null;

	const alignClasses = {
		left: "left-0",
		right: "right-0",
		center: "left-1/2 -translate-x-1/2",
	};

	return (
		<>
			<div
				className="fixed inset-0 z-40"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div className="absolute top-[2.5rem] w-full pointer-events-none overflow-visible z-50">
				<div
					className={`${alignClasses[align]} bg-card backdrop-blur-sm rounded-lg shadow-lg min-w-56 overflow-hidden pointer-events-auto ${className}`}
				>
				<div className="py-1.5">
					{items.map((item, index) => (
						<div key={item.id || index}>
							{renderItem ? (
								renderItem(item, onClose)
							) : (
								<DropdownItemComponent item={item} onClose={onClose} variant="dropdown" />
							)}
							{index < items.length - 1 && (
								<div className="my-1 h-px bg-muted/30 mx-3" />
							)}
						</div>
					))}
				</div>
				</div>
			</div>
		</>
	);
}
