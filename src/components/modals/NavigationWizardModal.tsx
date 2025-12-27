"use client";

import { Fragment, useRef, useEffect, useMemo, useState, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ENTITY_DATA } from "@/config/entities";
import { useRouter, usePathname } from "next/navigation";
import { WizardTable, type WizardColumn } from "@/src/components/ui/wizzard/WizardTable";
import { Search, Loader2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { getWizardEntities, type WizardEntity } from "@/actions/wizard-sql-action";
import { PopUpRows } from "@/src/components/ui/popup/PopUpRows";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import React from "react";

interface NavigationWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TARGET_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export function NavigationWizardModal({ isOpen, onClose }: NavigationWizardModalProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);
    const [subItems, setSubItems] = useState<WizardEntity[]>([]);
    const [isLoadingSubList, setIsLoadingSubList] = useState(false);

    const allEntities = useMemo(() => TARGET_ENTITIES.map(id => 
        ENTITY_DATA.find(e => e.id === id)
    ).filter((e): e is typeof ENTITY_DATA[number] => !!e), []);

    const expandedEntityName = useMemo(() => 
        allEntities.find(e => e.id === expandedEntityId)?.name, 
    [expandedEntityId, allEntities]);

    // Reset state when closing
    const handleClose = useCallback(() => {
        setExpandedEntityId(null);
        setSubItems([]);
        onClose();
    }, [onClose]);

    // MAIN NAVIGATION
    const mainNav = useModalNavigation({
        items: allEntities,
        filterField: (item) => `${item.name} ${item.description.join(" ")}`,
        isOpen,
        isActive: !expandedEntityId, // Only active when not expanded
        onSelect: (item) => {
            handleClose();
            router.push(item.link);
        }
    });

    // SUB NAVIGATION
    const subNav = useModalNavigation({
        items: subItems,
        filterField: "title", // WizardEntity has 'title'
        isOpen,
        isActive: !!expandedEntityId,
        onSelect: (item) => {
            handleClose();
            router.push(`/${expandedEntityId}s/${item.id}`);
        }
    });

    // Fetch sub-list data
    useEffect(() => {
        if (expandedEntityId) {
            setIsLoadingSubList(true);
            getWizardEntities(expandedEntityId)
                .then((data) => {
                    setSubItems(data);
                    setIsLoadingSubList(false);
                })
                .catch(() => {
                    setSubItems([]);
                    setIsLoadingSubList(false);
                });
        } else {
            setSubItems([]);
        }
    }, [expandedEntityId]);

    // Handle Tab / Shift+Tab and Implicit Search logic
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Tab Logic
            if (e.key === "Tab") {
                e.preventDefault();
                if (expandedEntityId) {
                    if (e.shiftKey) {
                        setExpandedEntityId(null);
                        // Clear implicit search when returning
                        mainNav.setSearchQuery("");
                    }
                } else {
                    if (e.shiftKey) {
                        // Shift + Tab: Close modal if in main list
                        handleClose();
                    } else if (mainNav.selectedItem) {
                        // Tab: Go to sub-list
                        setExpandedEntityId(mainNav.selectedItem.id);
                    }
                }
                return;
            }

            // Implicit Search for Main List (Only when not expanded and not using nav keys)
            if (!expandedEntityId && e.key.length === 1 && /[a-z]/i.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
                // If it's a hotkey map
                const key = e.key.toLowerCase();
                const map: Record<string, string> = {
                    's': 'student',
                    't': 'teacher',
                    'p': 'schoolPackage',
                    'b': 'booking',
                    'e': 'equipment'
                };
                
                // If key matches a mapped entity, focus it directly
                if (map[key]) {
                    const index = allEntities.findIndex(entity => entity.id === map[key]);
                    if (index !== -1) {
                        mainNav.setFocusedIndex(index);
                        // Optional: Clear any previous search to ensure we see all items but focused on the right one?
                        // Or just filter? The user said "s for student", implying quick selection.
                        // Jumping focus is cleaner than filtering for single letters if we want to keep the list visible.
                        // But if we want to filter, we'd do mainNav.setSearchQuery(key).
                        // Let's go with Focus jumping because it feels faster/smoother than filtering UI churn for 5 items.
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, expandedEntityId, mainNav.selectedItem, allEntities, mainNav.setFocusedIndex, mainNav.setSearchQuery]);

    // Initial sync
    useEffect(() => {
        if (isOpen && !expandedEntityId) {
            const currentIndex = allEntities.findIndex(e => pathname.startsWith(e.link));
            if (currentIndex !== -1) {
                mainNav.setFocusedIndex(currentIndex);
            }
        }
    }, [isOpen, pathname, allEntities, mainNav.setFocusedIndex, expandedEntityId]);

    const columns: WizardColumn<typeof ENTITY_DATA[number]>[] = [
        {
            id: "icon",
            header: "",
            width: "60px",
            align: "center",
            cell: (entity) => {
                const Icon = entity.icon;
                return (
                    <div className="p-2 rounded-lg bg-muted/20" style={{ color: entity.color }}>
                        <Icon className="w-6 h-6" />
                    </div>
                );
            }
        },
        {
            id: "name",
            header: "",
            width: "1fr",
            cell: (entity) => (
                <div className="flex flex-col">
                    <span className="font-bold text-lg">{entity.name}</span>
                    <span className="text-xs text-muted-foreground">{entity.description[0]}</span>
                </div>
            )
        },
        {
            id: "action",
            header: "",
            width: "40px",
            align: "center",
            cell: (entity, { isHovered }) => (
                <GoToAdranlink 
                    href={entity.link} 
                    onNavigate={handleClose} 
                    isHovered={isHovered}
                />
            )
        }
    ];

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleClose} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel className="w-full max-w-2xl outline-none">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="relative flex flex-col max-h-[85vh]"
                            >
                                {/* Header with Breadcrumbs */}
                                <div className="mb-6 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <motion.div
                                            className="flex items-center gap-2 cursor-pointer group"
                                            onClick={() => {
                                                if (expandedEntityId) {
                                                    setExpandedEntityId(null);
                                                }
                                            }}
                                            whileHover={expandedEntityId ? { scale: 1.05 } : undefined}
                                        >
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
                                                className="text-white"
                                            >
                                                <AdranlinkIcon size={32} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                            </motion.div>
                                            
                                            <motion.h2 
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                                                className={`text-3xl font-bold tracking-tight text-white ${expandedEntityId ? "group-hover:text-white/80 transition-colors" : ""}`}
                                            >
                                                Adrenalink
                                            </motion.h2>
                                        </motion.div>

                                        <AnimatePresence>
                                            {expandedEntityId && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <ChevronRight className="text-white/40 w-6 h-6" />
                                                    <h2 className="text-3xl font-bold tracking-tight text-white/60">
                                                        {expandedEntityName}
                                                    </h2>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    
                                    <motion.p
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                                        className="text-white/40 text-sm font-medium"
                                    >
                                        {expandedEntityId ? "Select an item" : "Navigate your way"}
                                    </motion.p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!expandedEntityId ? (
                                        <motion.div
                                            key="main-list"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col flex-1 min-h-0"
                                        >
                                            {/* No Main Search Input anymore */}
                                            
                                            <div className="flex-1 min-h-0">
                                                <WizardTable
                                                    data={mainNav.filteredItems}
                                                    columns={columns}
                                                    onRowClick={(item) => {
                                                        handleClose();
                                                        router.push(item.link);
                                                    }}
                                                    getRowId={(e) => e.id}
                                                    getRowAccentColor={(e) => e.color}
                                                    selectedId={mainNav.selectedItem?.id}
                                                    hideHeader={true}
                                                    className="max-h-[50vh]"
                                                />
                                            </div>
                                            
                                            {/* Tab Hint */}
                                            {mainNav.selectedItem && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-4 text-center"
                                                >
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-white/40">
                                                        <span>Press</span>
                                                        <span className="bg-white/10 px-1 py-0.5 rounded text-white/60 font-bold">TAB</span>
                                                        <span>to browse {mainNav.selectedItem.name}</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="sub-list"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col flex-1 min-h-0"
                                        >
                                            {/* Sub List Search */}
                                            <PopUpSearch 
                                                value={subNav.searchQuery}
                                                onChange={subNav.setSearchQuery}
                                                className="mb-4"
                                            />

                                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar max-h-[50vh]">
                                                {isLoadingSubList ? (
                                                    <div className="flex items-center justify-center h-32 text-white/40">
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                    </div>
                                                ) : (
                                                    <PopUpRows
                                                        items={subNav.filteredItems.map(item => ({
                                                            id: item.id,
                                                            title: item.title,
                                                            subtitle: item.subtitle,
                                                            isActive: item.status === 'Active',
                                                        }))}
                                                        selectedId={subNav.selectedItem?.id}
                                                        onSelect={(item) => {
                                                            handleClose();
                                                            router.push(`/${expandedEntityId}s/${item.id}`);
                                                        }}
                                                        renderItem={(item, isSelected) => (
                                                            <div className="flex items-center justify-between px-4 py-3 gap-4">
                                                                <div className="flex flex-col">
                                                                    <span className={`font-medium ${isSelected ? "text-white" : "text-white/60"}`}>
                                                                        {item.title}
                                                                    </span>
                                                                    <span className="text-xs text-white/30">
                                                                        {item.subtitle}
                                                                    </span>
                                                                </div>
                                                                <div className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${item.isActive ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"}`}>
                                                                    {item.isActive ? "Active" : "Inactive"}
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                )}
                                            </div>

                                            {/* Back Hint */}
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-4 text-center"
                                            >
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-white/40">
                                                    <span>Press</span>
                                                    <span className="bg-white/10 px-1 py-0.5 rounded text-white/60 font-bold">Shift + TAB</span>
                                                    <span>to go back</span>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer Hint (Always visible) */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-2 text-center"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent text-[10px] font-mono text-white/20">
                                        <span className="bg-white/5 px-1 py-0.5 rounded text-white/40 font-bold">ESC</span>
                                        <span>to close</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
