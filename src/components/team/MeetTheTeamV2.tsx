"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAM_ENTITIES, TEAM_COLORS } from "@/config/team-entities";

interface MeetTheTeamV2Props {
    hoveredShade: string | null;
    onShadeHover?: (shade: string | null) => void;
}

const Team = ({ onShadeHover, rainbowHoveredShade }: { onShadeHover?: (shade: string | null) => void; rainbowHoveredShade: string | null }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleClick = (entityId: string) => {
        setSelectedId(selectedId === entityId ? null : entityId);
    };

    const handleMouseEnter = (entity: (typeof TEAM_ENTITIES)[0]) => {
        setHoveredId(entity.id);
        onShadeHover?.(entity.colorKey);
    };

    const handleMouseLeave = () => {
        setHoveredId(null);
        onShadeHover?.(null);
    };

    const selectedEntity = selectedId ? TEAM_ENTITIES.find((e) => e.id === selectedId) : null;

    return (
        <div className="max-w-7xl mx-auto px-6 mt-8">
            <nav className="flex items-center justify-center">
                <div className="flex flex-wrap items-center justify-center bg-zinc-800/30 rounded-2xl p-1.5 gap-1">
                    {TEAM_ENTITIES.map((entity, index) => {
                        const isHovered = hoveredId === entity.id;
                        const isSelected = selectedId === entity.id;
                        const Icon = entity.icon;

                        return (
                            <motion.div
                                key={entity.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer relative ${isSelected ? "bg-zinc-900 shadow-lg scale-105" : "hover:bg-zinc-900/50 hover:backdrop-blur-md hover:shadow-sm"}`}
                                onMouseEnter={() => handleMouseEnter(entity)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleClick(entity.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSelected && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl opacity-20 blur-md"
                                        style={{ backgroundColor: TEAM_COLORS[entity.colorKey].fill }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                <motion.div
                                    className="w-6 h-6 relative z-10 transition-all [&>svg]:w-full [&>svg]:h-full"
                                    animate={{
                                        rotate: isSelected ? 360 : 0,
                                        scale: isSelected ? 1.2 : 1,
                                    }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    style={{
                                        color: isHovered || isSelected
                                            ? isHovered && !isSelected
                                                ? TEAM_COLORS[entity.colorKey].hoverFill
                                                : TEAM_COLORS[entity.colorKey].fill
                                            : "#ffffff",
                                    }}
                                >
                                    <Icon />
                                </motion.div>

                                <motion.span
                                    className="text-sm font-medium transition-colors relative z-10"
                                    animate={{
                                        fontWeight: isSelected ? 700 : 500,
                                    }}
                                    style={{ color: isHovered || isSelected ? TEAM_COLORS[entity.colorKey].fill : "#ffffff" }}
                                >
                                    {entity.name}
                                </motion.span>

                                {isSelected && (
                                    <motion.div
                                        className="w-1.5 h-1.5 rounded-full ml-1 relative z-10"
                                        style={{ backgroundColor: TEAM_COLORS[entity.colorKey].fill }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </nav>

            <AnimatePresence mode="wait">
                {selectedEntity && (
                    <motion.div
                        key={selectedEntity.id}
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-8 text-center overflow-hidden"
                    >
                        <motion.div
                            className="inline-block px-8 py-6 rounded-2xl border-2 backdrop-blur-md bg-zinc-900/50"
                            style={{ borderColor: TEAM_COLORS[selectedEntity.colorKey].fill }}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-xl font-medium text-white" style={{ color: TEAM_COLORS[selectedEntity.colorKey].fill }}>
                                {selectedEntity.description}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="text-center mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedEntity ? 0.3 : 1 }}
                transition={{ duration: 0.4 }}
            >
                <span className="text-lg text-gray-400/60 italic tracking-wider">
                    Think of each icon as a character, each with a specific role
                </span>
            </motion.div>
        </div>
    );
};

export const MeetTheTeamV2 = ({ hoveredShade, onShadeHover }: MeetTheTeamV2Props) => {
    const selectedEntity = hoveredShade ? TEAM_ENTITIES.find((entity) => entity.colorKey === hoveredShade) || null : null;
    const SelectedIcon = selectedEntity ? selectedEntity.icon : null;

    return (
        <div className="relative z-[2] py-16">
            {selectedEntity && SelectedIcon ? (
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border-2" style={{ borderColor: TEAM_COLORS[selectedEntity.colorKey].fill }}>
                        <div className="w-20 h-20 mx-auto mb-4 [&>svg]:w-full [&>svg]:h-full" style={{ color: TEAM_COLORS[selectedEntity.colorKey].fill }}>
                            <SelectedIcon />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{selectedEntity.name}</h3>
                        <p className="text-xl text-gray-300">{selectedEntity.description}</p>
                    </div>
                </div>
            ) : (
                <div
                    className="animate-in slide-in-from-bottom-8 fade-in duration-300"
                    style={{
                        animation: hoveredShade === null ? "slideUp 0.3s ease-out" : "slideDown 0.3s ease-out",
                    }}
                >
                    <Team onShadeHover={onShadeHover} />
                </div>
            )}

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }
            `}</style>
        </div>
    );
};
