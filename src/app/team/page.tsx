"use client";

import { motion } from "framer-motion";
import { TEAM_ENTITIES, TEAM_COLORS } from "@/config/team-entities";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

export default function TeamPage() {
    return (
        <section className="py-32 bg-background min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="mb-24 text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <AdranlinkIcon className="text-primary w-6 h-6" />
                            <p className="text-primary font-mono text-sm">Adrenalink</p>
                        </div>
                        <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
                            Meet the team.
                            <br />
                            <span className="text-muted-foreground">Your growth partners.</span>
                        </h2>
                        <p className="mt-6 text-xl text-muted-foreground font-display">
                            Everything you need to scale your adrenaline business
                        </p>
                    </motion.div>

                    {/* Rainbow Grid */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                },
                            },
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {TEAM_ENTITIES.map((entity, index) => {
                            const Icon = entity.icon;
                            const color = TEAM_COLORS[entity.colorKey];

                            return (
                                <motion.div
                                    key={entity.id}
                                    variants={{
                                        hidden: { y: 50, opacity: 0 },
                                        visible: {
                                            y: 0,
                                            opacity: 1,
                                            transition: { type: "spring", stiffness: 100, damping: 15 },
                                        },
                                    }}
                                    className="group relative p-6 rounded-2xl border border-border bg-card/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    style={{
                                        borderColor: `${color.fill}20`,
                                    }}
                                >
                                    {/* Icon Circle */}
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                                        style={{
                                            backgroundColor: `${color.fill}15`,
                                        }}
                                    >
                                        <Icon
                                            className="w-8 h-8 transition-colors duration-300"
                                            style={{ color: color.fill }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <h3
                                        className="text-2xl font-bold mb-2 transition-colors duration-300"
                                        style={{ color: color.fill }}
                                    >
                                        {entity.name}
                                    </h3>
                                    <p className="text-muted-foreground">{entity.description}</p>

                                    {/* Hover Accent */}
                                    <div
                                        className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                                        style={{ backgroundColor: color.fill }}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-24 text-center"
                    >
                        <a
                            href="/"
                            className="inline-block px-8 py-4 rounded-full border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-bold"
                        >
                            Back to Home
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
