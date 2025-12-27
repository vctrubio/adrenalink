"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { SchoolPackageModel } from "@/backend/models/SchoolPackageModel";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface UserSelectPackageProps {
    packages: SchoolPackageModel[];
    equipmentCategories: string[]; // Available categories for this school
}

export function UserSelectPackage({ packages, equipmentCategories }: UserSelectPackageProps) {
    const [step, setStep] = useState<"intro" | "category" | "list">("intro");
    const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

    // Filter packages based on selection
    const filteredPackages = packages.filter(pkg => 
        selectedCategory === "all" || pkg.schema.categoryEquipment === selectedCategory
    );

    // Available categories from config that match school's offerings
    const activeCategories = EQUIPMENT_CATEGORIES.filter(cat => 
        equipmentCategories.includes(cat.id)
    );

    const handleStart = () => setStep("category");
    
    const handleCategorySelect = (categoryId: string | "all") => {
        setSelectedCategory(categoryId);
        setStep("list");
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
                
                {/* STEP 1: INTRO */}
                {step === "intro" && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="text-center cursor-pointer group"
                        onClick={handleStart}
                    >
                        <motion.div 
                            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20"
                            whileHover={{ rotate: 90 }}
                        >
                            <AdranlinkIcon size={48} className="text-primary" />
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                            Find Your Adventure
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium text-lg group-hover:text-primary transition-colors">
                            <span>Get Started</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: CATEGORY SELECTION */}
                {step === "category" && (
                    <motion.div
                        key="category"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-2xl"
                    >
                        <h3 className="text-2xl font-bold text-center mb-8 text-foreground/80">What are you interested in?</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* "All" Option */}
                            <button
                                onClick={() => handleCategorySelect("all")}
                                className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all group text-left"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <AdranlinkIcon size={24} />
                                </div>
                                <div>
                                    <span className="block font-bold text-lg">Browse All</span>
                                    <span className="text-sm text-muted-foreground">View everything we offer</span>
                                </div>
                                <ChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </button>

                            {/* Specific Categories */}
                            {activeCategories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all group text-left"
                                    >
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors group-hover:text-white"
                                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-lg">{cat.name}</span>
                                            <span className="text-sm text-muted-foreground">{filteredPackages.filter(p => p.schema.categoryEquipment === cat.id).length} packages</span>
                                        </div>
                                        <ChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: PACKAGE LIST */}
                {step === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full text-center"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <button 
                                onClick={() => setStep("category")}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                <ArrowRight className="rotate-180 w-4 h-4" /> Back to categories
                            </button>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                                {selectedCategory === "all" ? "All Packages" : activeCategories.find(c => c.id === selectedCategory)?.name}
                            </span>
                        </div>

                        {/* Package Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                            {filteredPackages.map(pkg => (
                                <div key={pkg.schema.id} className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {pkg.schema.packageType}
                                        </span>
                                        <span className="font-bold text-xl text-primary">€{pkg.schema.pricePerStudent}</span>
                                    </div>
                                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{pkg.schema.description}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <span>{pkg.schema.durationMinutes} min</span>
                                        <span>•</span>
                                        <span className="capitalize">{pkg.schema.categoryEquipment}</span>
                                    </div>
                                    <button className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity">
                                        Book Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
