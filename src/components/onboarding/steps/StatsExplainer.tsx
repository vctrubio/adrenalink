"use client";

import { useState } from "react";
import { STAT_TYPE_CONFIG } from "@/backend/data/StatsData";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

const CORE_STATS = [
  { type: "students" as const, description: "Registration & tracking", number: "01", detail: "Bookings..." },
  { type: "teachers" as const, description: "Hours & commissions", number: "02", detail: "Lessons..." },
  { type: "bookings" as const, description: "Smart scheduling", number: "03", detail: "Events..." },
  { type: "equipments" as const, description: "Lifecycle management", number: "04", detail: "Activity..." },
  { type: "packages" as const, description: "Set your prices", number: "05", detail: "Pricing..." },
];

export default function StatsExplainer() {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const togglePillar = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPillar(expandedPillar === type ? null : type);
  };

  const displayedPillars = CORE_STATS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl"
    >
      <div className="space-y-0">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">The System</h2>
          <p className="text-sm text-muted-foreground mt-2">Click a pillar to explore</p>
        </div>

        <AnimatePresence>
          {displayedPillars.map((pillar) => {
            const config = STAT_TYPE_CONFIG[pillar.type];
            const isExpanded = expandedPillar === pillar.type;

            return (
              <motion.div
                key={pillar.type}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="border-t border-border overflow-hidden"
              >
                <div
                  onClick={(e) => togglePillar(pillar.type, e)}
                  className="group py-12 flex items-center gap-8 hover:bg-muted/30 transition-colors px-4 cursor-pointer"
                >
                  <span className="text-5xl font-display font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors w-20">
                    {pillar.number}
                  </span>
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <config.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {config.label}
                    </h3>
                    <p className="text-muted-foreground">{pillar.description}</p>
                  </div>
                  <div className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-8 bg-muted/20"
                    >
                      <div className="pl-32">
                        <p className="text-muted-foreground">{pillar.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div className="border-t border-border" />
      </div>
    </motion.div>
  );
}
