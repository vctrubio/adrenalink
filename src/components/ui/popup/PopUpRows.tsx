"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { PopUpRowsProps, PopUpItem } from "@/types/popup";

export function PopUpRows<T extends PopUpItem>({ items, renderItem, selectedId, onSelect, className = "" }: PopUpRowsProps<T>) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
            className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar ${className}`}
        >
            <div className="flex flex-col gap-2 p-1">
                <AnimatePresence initial={false}>
                    {items.map((item, index) => {
                        const isSelected = selectedId === item.id;
                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -5 }}
                                transition={{ delay: index * 0.02, duration: 0.2, ease: "easeOut" }}
                                onClick={() => onSelect?.(item)}
                                className={`
                                    relative rounded-xl border transition-all cursor-pointer group
                                    ${isSelected 
                                        ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                                        : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                                    }
                                `}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="popup-selection-indicator"
                                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                {renderItem(item, isSelected)}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {items.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground">
                        No items found
                    </div>
                )}
            </div>
        </motion.div>
    );
}
