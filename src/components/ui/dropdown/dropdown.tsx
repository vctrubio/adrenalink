"use client";

import { ReactNode, useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownItem as DropdownItemComponent, type DropdownItemProps } from "./dropdown-item";

interface DropdownProps {
	isOpen: boolean;
	onClose: () => void;
	items: DropdownItemProps[];
	renderItem?: (item: DropdownItemProps, onClose: () => void) => ReactNode;
	align?: "left" | "right" | "center";
	className?: string;
	initialFocusedId?: string | number;
	triggerRef?: React.RefObject<HTMLElement>;
}

export default function Dropdown({
	isOpen,
	onClose,
	items,
	renderItem,
	align = "right",
	className = "",
	initialFocusedId,
	triggerRef,
}: DropdownProps) {
	const [focusedIndex, setFocusedIndex] = useState(0);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, width: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

	// Update coordinates when opened
	useEffect(() => {
		if (isOpen && triggerRef?.current) {
			const updatePosition = () => {
				const rect = triggerRef.current!.getBoundingClientRect();
				setCoords({
					top: rect.bottom + 8,
					left: rect.left,
					right: window.innerWidth - rect.right,
					width: rect.width,
				});
			};
			
			updatePosition();
			window.addEventListener('resize', updatePosition);
			window.addEventListener('scroll', updatePosition, true);
			
			return () => {
				window.removeEventListener('resize', updatePosition);
				window.removeEventListener('scroll', updatePosition, true);
			};
		}
	}, [isOpen, triggerRef]);

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

	// Render Content
	const renderContent = () => (
		<motion.div
			initial={{ opacity: 0, y: -8, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -8, scale: 0.95 }}
			transition={{ duration: 0.15, ease: "easeOut" }}
			className={`bg-card border border-border rounded-lg shadow-xl min-w-[200px] overflow-hidden ${className}`}
			style={triggerRef ? {
				position: "fixed",
				top: coords.top,
				...(align === "left" ? { left: coords.left } : {}),
				...(align === "right" ? { right: coords.right } : {}),
				...(align === "center" ? { left: coords.left + coords.width / 2, transform: "translateX(-50%)" } : {}),
				zIndex: 9999,
				maxHeight: "calc(100vh - 20px)",
				overflowY: "auto",
			} : {
                // Fallback style for no triggerRef (mimic old absolute behavior but better)
                position: "absolute",
                top: "100%",
                marginTop: "0.5rem",
                ...(align === "left" ? { left: 0 } : {}),
                ...(align === "right" ? { right: 0 } : {}),
                ...(align === "center" ? { left: "50%", transform: "translateX(-50%)" } : {}),
                zIndex: 50,
            }}
		>
			<div className="py-1">
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
		</motion.div>
	);

    const backdrop = (
        <div className="fixed inset-0 z-[9998]" onClick={onClose} aria-hidden="true" />
    );
    
    // Only render if mounted (client-side)
    if (!mounted) return null;

    // If triggerRef is provided, use Portal
    if (triggerRef) {
        // Safe check for document.body
        if (typeof document === 'undefined') return null;

        return createPortal(
            <AnimatePresence>
                {isOpen && (
                    <>
                        {backdrop}
                        {renderContent()}
                    </>
                )}
            </AnimatePresence>,
            document.body
        );
    }

    // Legacy Fallback (No Portal) - Keep mostly compatible with old behavior layout-wise
    return (
        <AnimatePresence>
             {isOpen && (
                 <>
                    <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
                    <div className="relative z-50">
                        {renderContent()}
                    </div>
                 </>
             )}
        </AnimatePresence>
    );
}
