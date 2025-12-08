"use client";

import { ReactNode, useEffect, useState, useCallback, useRef } from "react";
import { DropdownItem as DropdownItemComponent, type DropdownItemProps } from "./dropdown-item";

interface DropdownProps {
	isOpen: boolean;
	onClose: () => void;
	items: DropdownItemProps[];
	renderItem?: (item: DropdownItemProps, onClose: () => void) => ReactNode;
	align?: "left" | "right" | "center";
	className?: string;
	initialFocusedId?: string | number;
}

export default function Dropdown({
	isOpen,
	onClose,
	items,
	renderItem,
	align = "right",
	className = "",
	initialFocusedId,
}: DropdownProps) {
	const [focusedIndex, setFocusedIndex] = useState(0);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		if (isOpen) {
			const initialIndex = initialFocusedId ? items.findIndex((item) => item.id === initialFocusedId) : -1;

			setFocusedIndex(initialIndex !== -1 ? initialIndex : 0);
			itemRefs.current = itemRefs.current.slice(0, items.length);
		}
	}, [isOpen, items, initialFocusedId]);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!isOpen || items.length === 0) return;

			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					setFocusedIndex((prevIndex) => (prevIndex + 1) % items.length);
					break;
				case "ArrowUp":
					event.preventDefault();
					setFocusedIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
					break;
				case "Enter":
					event.preventDefault();
					const focusedItemDiv = itemRefs.current[focusedIndex];
					const clickableElement = focusedItemDiv?.querySelector("a, button");
					if (clickableElement instanceof HTMLElement) {
						clickableElement.click();
					}
					break;
				case "Escape":
					event.preventDefault();
					onClose();
					break;
			}
		},
		[isOpen, items.length, focusedIndex, onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, handleKeyDown]);

	useEffect(() => {
		if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
			itemRefs.current[focusedIndex]?.scrollIntoView({
				block: "nearest",
			});
		}
	}, [isOpen, focusedIndex]);

	if (!isOpen) return null;

	const alignClasses = {
		left: "left-0",
		right: "right-0",
		center: "left-1/2 -translate-x-1/2",
	};

	return (
		<>
			<div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
			<div className="absolute top-[2.5rem] w-full pointer-events-none overflow-visible z-50">
				<div
					className={`${alignClasses[align]} bg-card backdrop-blur-sm rounded-lg shadow-lg min-w-56 pointer-events-auto max-h-[calc(100vh-8rem)] overflow-y-auto ${className}`}
				>
					<div className="py-1.5">
						{items.map((item, index) => (
							<div
								key={item.id || index}
								ref={(el) => (itemRefs.current[index] = el)}
								onMouseEnter={() => setFocusedIndex(index)}
							>
								{renderItem ? (
									renderItem(item, onClose)
								) : (
									<DropdownItemComponent
										item={item}
										onClose={onClose}
										variant="dropdown"
										isFocused={index === focusedIndex}
									/>
								)}
								{index < items.length - 1 && <div className="my-1 h-px bg-muted/30 mx-3" />}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
