"use client";

import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { ENTITY_DATA } from "@/config/entities";
import { SpinAdranalink } from "@/src/components/ui/SpinAdranalink";

const pillarConfig = [
  { 
    id: "student", 
    number: "01", 
    title: "Students", 
    description: "Registration & tracking",
    details: "Comprehensive student profiles, digital waivers, progress tracking, and automated communication tools to keep your community engaged."
  },
  { 
    id: "teacher", 
    number: "02", 
    title: "Teachers", 
    description: "Hours & commissions",
    details: "Automated hours logging, commission calculations based on performance, and simplified payroll management for your instructors."
  },
  { 
    id: "booking", 
    number: "03", 
    title: "Bookings", 
    description: "Smart scheduling",
    details: "Drag-and-drop calendar, conflict detection, recurring appointments, and real-time availability for seamless class management."
  },
  { 
    id: "equipment", 
    number: "04", 
    title: "Equipment", 
    description: "Lifecycle management",
    details: "Inventory tracking, maintenance alerts, rental management, and usage history to extend the life of your valuable assets."
  },
  {
    id: "schoolPackage",
    number: "05",
    title: "Payments",
    description: "Set your prices",
    details: "Flexible pricing tiers, secure payment processing, and automated invoicing to streamline your revenue stream."
  },
  {
    id: "rental",
    number: "06",
    title: "Rentals",
    description: "Equipment hire",
    details: "Manage direct equipment rentals, track returns, handle deposits, and ensure inventory availability for students."
  }
];

const PillarsMinimal = () => {
  const [openPillarId, setOpenPillarId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  
  const [extraPillarsCount, setExtraPillarsCount] = useState(0);
  const [isMoreButtonVisible, setIsMoreButtonVisible] = useState(true);

  const togglePillar = (id: string) => {
    setOpenPillarId(openPillarId === id ? null : id);
  };

  const handleGetStarted = () => {
    console.log("action-user-click-started");
    setIsStarting(true);
  };

  const handleTellMeMore = () => {
      if (extraPillarsCount < 2) {
          setExtraPillarsCount(prev => prev + 1);
      } else {
          console.log("finish");
          setIsMoreButtonVisible(false);
      }
  };

  return (
    <section className="py-32 bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto relative">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isStarting ? { opacity: 0, y: -100, filter: "blur(10px)", scale: 0.9 } : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="mb-24"
          >
            <div className="flex items-center gap-2 mb-4">
              <AdranlinkIcon className="text-primary w-6 h-6" />
              <p className="text-primary font-mono text-sm">Adrenalink</p>
            </div>
            <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Four pillars.
              <br />
              <span className="text-muted-foreground">One platform.</span>
            </h2>
            <p className="mt-6 text-xl text-muted-foreground font-display">
              Home of Adrenaline Activities
            </p>
          </motion.div>

          {/* Pillars list */}
          <motion.div 
            initial="hidden"
            animate={isStarting ? { opacity: 0, x: -100, filter: "blur(10px)" } : "visible"}
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.15
                    }
                }
            }}
            className="space-y-4"
          >
            {pillarConfig.filter((_, i) => i < (4 + extraPillarsCount)).map((pillar, index) => {
              const entity = ENTITY_DATA.find(e => e.id === pillar.id);
              const Icon = entity ? entity.icon : AdranlinkIcon;
              const isOpen = openPillarId === pillar.id;
              const isColored = extraPillarsCount > 0;

              return (
                <motion.div
                  key={pillar.id}
                  variants={{
                    hidden: { y: -80, opacity: 0 },
                    visible: { 
                        y: 0, 
                        opacity: 1,
                        transition: { type: "spring", stiffness: 120, damping: 14 }
                    }
                  }}
                  className="border border-border rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm relative z-10"
                >
                  <div 
                    onClick={() => togglePillar(pillar.id)}
                    className="group py-8 px-6 md:px-10 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 md:gap-8 flex-1">
                      {/* Number */}
                      <span 
                        className={`text-3xl md:text-5xl font-display font-bold transition-colors w-12 md:w-20 ${
                            isColored 
                                ? "group-hover:!text-muted-foreground/30" 
                                : "text-muted-foreground/30 group-hover:text-primary/50"
                        }`}
                        style={{ color: isColored ? entity?.color : undefined }}
                      >
                        {pillar.number}
                      </span>

                      {/* Icon */}
                      <div 
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isColored ? "" : "border border-border"
                        }`}
                        style={{
                            backgroundColor: isOpen ? (entity?.bgColor || '') : 'transparent',
                        }}
                      >
                         <div style={{ color: isColored ? entity?.color : undefined }}>
                            <Icon className="w-5 h-5 transition-colors duration-300" />
                         </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-display text-xl md:text-2xl font-bold transition-colors text-foreground group-hover:text-primary">
                          {pillar.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground">{pillar.description}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                  </div>

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-10 px-6 md:px-10 md:pl-36">
                            <div className="p-6 rounded-xl bg-muted/50 border border-border/50">
                                <p className="text-muted-foreground leading-relaxed">
                                    {pillar.details}
                                </p>
                            </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer */}
          <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start flex-wrap">
              <button 
                onClick={handleGetStarted}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className="px-6 py-3 rounded-full border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-3 relative z-20"
              >
                <SpinAdranalink 
                    isSpinning={isStarting || isButtonHovered} 
                    duration={isStarting ? 0.3 : 0.8} 
                    size={20} 
                />
                <span>Get Started</span>
              </button>
              
              <motion.div 
                animate={isStarting ? { opacity: 0, x: 100, filter: "blur(5px)" } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: "expoIn" }}
                className="flex items-center gap-6"
              >
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors group">
                    <AdminIcon className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="font-medium">Register as a School</span>
                  </div>

                  {isMoreButtonVisible && (
                      <div 
                        onClick={handleTellMeMore}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors group relative"
                      >
                        <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="font-medium">Tell me more</span>
                        
                        {/* Counter Badge */}
                        <AnimatePresence mode="wait">
                            <motion.span 
                                initial={{ scale: 0, opacity: 0, y: 5 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0, opacity: 0, y: -5 }}
                                key={extraPillarsCount}
                                className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                            >
                                {4 + extraPillarsCount}
                            </motion.span>
                        </AnimatePresence>
                      </div>
                  )}
              </motion.div>
            </div>

            <motion.div 
                 animate={isStarting ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, ease: "expoIn" }}
                 className="flex items-center gap-4"
            >
              <span className="text-muted-foreground text-sm">Change the wind</span>
              <WindToggle />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarsMinimal;