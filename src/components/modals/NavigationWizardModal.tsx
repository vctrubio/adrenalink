"use client";

import { Fragment, useRef, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ENTITY_DATA } from "@/config/entities";
import { useRouter, usePathname } from "next/navigation";
import { WizardTable, type WizardColumn } from "@/src/components/ui/wizzard/WizardTable";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
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

    const allEntities = useMemo(() => TARGET_ENTITIES.map(id => 
        ENTITY_DATA.find(e => e.id === id)
    ).filter((e): e is typeof ENTITY_DATA[number] => !!e), []);

    const {
        searchQuery,
        setSearchQuery,
        filteredItems,
        focusedIndex,
        setFocusedIndex,
        selectedItem
    } = useModalNavigation({
        items: allEntities,
        filterField: (item) => `${item.name} ${item.description.join(" ")}`,
        isOpen,
        onSelect: (item) => {
            onClose();
            router.push(item.link);
        },
        // Shift+Enter behaves same as Enter for navigation
        onShiftSelect: (item) => {
            onClose();
            router.push(item.link);
        }
    });

    // Auto-focus search input
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Sync focused index with current route on open
    useEffect(() => {
        if (isOpen && !searchQuery) {
            const currentIndex = allEntities.findIndex(e => pathname.startsWith(e.link));
            if (currentIndex !== -1) {
                setFocusedIndex(currentIndex);
            }
        }
    }, [isOpen, pathname, allEntities, searchQuery, setFocusedIndex]);

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
                    onNavigate={onClose} 
                    isHovered={isHovered}
                />
            )
        }
    ];

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
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
                                <div className="mb-6 flex flex-col items-center">
                                    <div className="flex items-center gap-4 mb-1">
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
                                            className="text-3xl font-bold tracking-tight text-white"
                                        >
                                            Adrenalink
                                        </motion.h2>
                                    </div>
                                    
                                    <motion.p
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                                        className="text-white/40 text-sm font-medium"
                                    >
                                        Navigate your way
                                    </motion.p>
                                </div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                                    className="mb-4 relative group"
                                >
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-white transition-colors">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-md shadow-lg"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
                                    className="flex-1 min-h-0"
                                >
                                    <WizardTable
                                        data={filteredItems}
                                        columns={columns}
                                        onRowClick={(item) => {
                                            onClose();
                                            router.push(item.link);
                                        }}
                                        getRowId={(e) => e.id}
                                        getRowAccentColor={(e) => e.color}
                                        selectedId={selectedItem?.id}
                                        hideHeader={true}
                                        className="max-h-[50vh]"
                                    />
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                    className="mt-6 text-center"
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-white/40">
                                        <span className="bg-white/10 px-1 py-0.5 rounded text-white/60 font-bold">ESC</span>
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