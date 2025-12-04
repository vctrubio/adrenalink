"use client";

import { ReactNode } from "react";

export interface DropdownItem {
	id: string;
	label: string;
	icon?: React.ComponentType<any>;
	color?: string;
	description?: string;
	href?: string;
	onClick?: () => void;
}

interface DropdownProps {
	isOpen: boolean;
	onClose: () => void;
	items: DropdownItem[];
	renderItem?: (item: DropdownItem, onClose: () => void) => ReactNode;
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
			<div
				className={`absolute top-[4.5rem] ${alignClasses[align]} bg-card backdrop-blur-sm rounded-lg shadow-lg min-w-56 z-50 overflow-hidden ${className}`}
			>
				<div className="py-1.5">
					{items.map((item, index) => (
						<div key={item.id}>
							{renderItem ? (
								renderItem(item, onClose)
							) : (
								<DefaultDropdownItem item={item} onClose={onClose} />
							)}
							{index < items.length - 1 && (
								<div className="my-1 h-px bg-muted/30 mx-3" />
							)}
						</div>
					))}
				</div>
			</div>
		</>
	);
}

interface DefaultDropdownItemProps {
	item: DropdownItem;
	onClose: () => void;
}

function DefaultDropdownItem({ item, onClose }: DefaultDropdownItemProps) {
	const Icon = item.icon;
	const hasColor = item.color;

	const handleClick = () => {
		item.onClick?.();
		onClose();
	};

	const baseClasses =
		"flex items-center gap-3 px-3 py-2.5 w-full text-left transition-colors cursor-pointer";

	const content = (
		<>
			{Icon && (
				<div
					style={hasColor ? { color: item.color } : undefined}
					className="flex-shrink-0"
				>
					<Icon className="w-4 h-4" />
				</div>
			)}
			<div className="flex-1 min-w-0">
				<div className="text-sm font-medium text-foreground">
					{item.label}
				</div>
				{item.description && (
					<div className="text-xs text-muted-foreground mt-0.5">
						{item.description}
					</div>
				)}
			</div>
		</>
	);

	if (item.href) {
		return (
			<a
				href={item.href}
				onClick={handleClick}
				className={baseClasses}
				onMouseEnter={(e) => {
					if (hasColor) {
						e.currentTarget.style.backgroundColor = `${item.color}10`;
					} else {
						e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
					}
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = "transparent";
				}}
			>
				{content}
			</a>
		);
	}

	return (
		<button
			onClick={handleClick}
			className={baseClasses}
			onMouseEnter={(e) => {
				if (hasColor) {
					e.currentTarget.style.backgroundColor = `${item.color}10`;
				} else {
					e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
				}
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = "transparent";
			}}
		>
			{content}
		</button>
	);
}
