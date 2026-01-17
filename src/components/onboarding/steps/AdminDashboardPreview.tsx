"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { StatItemUI } from "@/backend/data/StatsData";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { TablesProvider } from "@/src/app/(admin)/(tables)/layout";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { MapPin } from "lucide-react";
import type { TransactionEventData } from "@/types/transaction-event";
import type { SchoolCredentials } from "@/types/credentials";

const MOCK_CREDENTIALS: SchoolCredentials = {
  id: "school-001",
  logoUrl: "/school-logo.png",
  bannerUrl: "/school-banner.png",
  currency: "YEN",
  name: "Adventure Sports Academy",
  username: "adventure-academy",
  status: "active",
  clerkId: "clerk-001",
  email: "info@adventureacademy.com",
  country: "Japan",
  timezone: "Asia/Tokyo",
};

const MOCK_TRANSACTION_EVENTS: TransactionEventData[] = [
  {
    event: {
      id: "evt-001",
      date: "2025-01-17T14:00:00Z",
      duration: 120,
      location: "Gym A",
      status: "completed",
    },
    teacher: {
      username: "john_smith",
      id: "teacher-001",
    },
    leaderStudentName: "Alice Johnson",
    studentCount: 3,
    studentNames: ["Alice Johnson", "David Lee", "Emma Smith"],
    packageData: {
      description: "Beginner Course",
      pricePerStudent: 50,
      durationMinutes: 480,
      categoryEquipment: "snowboard",
      capacityEquipment: 2,
      capacityStudents: 4,
    },
    financials: {
      teacherEarnings: 80,
      studentRevenue: 150,
      profit: 70,
      currency: "YEN",
      commissionType: "fixed",
      commissionValue: 8,
    },
    equipments: [
      {
        id: "eq-001",
        brand: "Burton",
        model: "Custom X",
        size: 160,
      },
    ],
  },
  {
    event: {
      id: "evt-002",
      date: "2025-01-17T16:30:00Z",
      duration: 90,
      location: "Gym B",
      status: "tbc",
    },
    teacher: {
      username: "sarah_lee",
      id: "teacher-002",
    },
    leaderStudentName: "Bob Wilson",
    studentCount: 2,
    studentNames: ["Bob Wilson", "Charlie Brown"],
    packageData: {
      description: "Advanced Techniques",
      pricePerStudent: 75,
      durationMinutes: 360,
      categoryEquipment: "ski",
      capacityEquipment: 1,
      capacityStudents: 2,
    },
    financials: {
      teacherEarnings: 85,
      studentRevenue: 112.5,
      profit: 27.5,
      currency: "YEN",
      commissionType: "percentage",
      commissionValue: 6,
    },
    equipments: [],
  },
];

export default function AdminDashboardPreview() {
  const eventEntity = ENTITY_DATA.find((e) => e.id === "event");
  const Icon = eventEntity?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full mx-auto"
    >
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm">See all events in one unified view</p>
        </div>

        {/* Mock Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          {/* Date Header */}
          <div className="flex items-center justify-between p-5 bg-muted/20 border-b border-border cursor-default">
            <div className="flex flex-col gap-1 min-w-[140px]">
              <span className="font-bold text-xl">Fri 17 Jan</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">2025</span>
            </div>

            <div className="flex items-center gap-6 text-sm flex-1 justify-center">
              <div>
                <StatItemUI type="completed" value="1/2" hideLabel={false} />
              </div>
              <div>
                <StatItemUI type="students" value={6} hideLabel={false} />
              </div>
              <div>
                <StatItemUI type="teachers" value={2} hideLabel={false} />
              </div>
              <div>
                <StatItemUI type="duration" value={210} hideLabel={false} />
              </div>
              <div className="hidden lg:block">
                <StatItemUI type="revenue" value={12500} hideLabel={false} />
              </div>
              <div className="hidden lg:block">
                <StatItemUI type="commission" value={4200} hideLabel={false} />
              </div>
            </div>

            <div className="ml-4 shrink-0">
              <ChevronDown size={20} className="text-muted-foreground/60" />
            </div>
          </div>

          {/* Events Table */}
          <SchoolCredentialsProvider credentials={MOCK_CREDENTIALS}>
            <TablesProvider>
              <TransactionEventsTable events={MOCK_TRANSACTION_EVENTS} />
            </TablesProvider>
          </SchoolCredentialsProvider>
        </motion.div>

        {/* Classboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.4 }}
          className="space-y-0 rounded-2xl border border-border overflow-hidden"
        >
          {/* Header - Mirroring TeacherClassDaily */}
          <div className="h-16 px-6 border-b-2 border-background bg-card flex items-center gap-4 select-none flex-shrink-0">
            <div style={{ color: "#16a34a" }}>
              <HeadsetIcon size={28} />
            </div>
            <span className="text-lg font-bold text-foreground">Teachers</span>

            {/* Start Time Section */}
            <div className="flex items-center gap-1 ml-4">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronDown size={18} className="text-muted-foreground rotate-90" />
              </button>
              <span className="font-mono text-xl font-bold text-foreground w-12 text-center">14:00</span>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronDown size={18} className="text-muted-foreground -rotate-90" />
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Active (2)</button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted">All (2)</button>
            </div>
          </div>

          {/* Content - Teacher Queue Rows */}
          <div className="divide-y-2 divide-background bg-card">
            {/* Queue Row 1 - john_smith */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-stretch"
            >
              {/* TeacherClassCard Section */}
              <div className="w-80 flex-shrink-0 p-2 border-r-2 border-background">
                <div className="rounded-xl border border-border bg-background overflow-hidden space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
                      <HeadsetIcon size={24} className="text-green-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">john_smith</p>
                      <p className="text-xs text-muted-foreground font-mono">14:00</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-foreground">1/2 Completed</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-green-600" />
                    </div>
                  </div>

                  <button className="w-full rounded-lg px-3 py-2.5 bg-muted/50 hover:bg-muted border border-border/50 transition-colors">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <div style={{ color: "#a78bfa" }}>
                          <DurationIcon size={12} />
                        </div>
                        <span className="font-bold text-foreground">1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{ color: "#a78bfa" }}>◄</span>
                        <span className="font-bold text-foreground">1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DurationIcon size={12} className="text-muted-foreground/70" />
                        <span className="font-bold text-foreground">3h30m</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="font-bold text-foreground">210</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-bold text-foreground">840</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Events Section - Horizontally scrollable */}
              <div className="flex-1 flex items-center p-2 gap-2 overflow-x-auto">
                {/* Event Card 1 */}
                <div className="flex-shrink-0 w-64 rounded-xl border border-border bg-background overflow-hidden">
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl font-black text-foreground leading-none">14:30</p>
                        <p className="text-xs text-muted-foreground font-bold mt-0.5">START +2h</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <div style={{ color: "#a78bfa" }}>
                          <DurationIcon size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 text-xs font-bold">Alice Johnson</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span className="font-bold">Gym A</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Queue Row 2 - sarah_lee */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex items-stretch"
            >
              {/* TeacherClassCard Section */}
              <div className="w-80 flex-shrink-0 p-2 border-r-2 border-background">
                <div className="rounded-xl border border-border bg-background overflow-hidden space-y-3 p-4 opacity-75">
                  <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
                      <HeadsetIcon size={24} className="text-amber-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">sarah_lee</p>
                      <p className="text-xs text-muted-foreground font-mono">16:30</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-foreground">0/1 Completed</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-0" />
                    </div>
                  </div>

                  <button className="w-full rounded-lg px-3 py-2.5 bg-muted/50 hover:bg-muted border border-border/50 transition-colors">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <div style={{ color: "#a78bfa" }}>
                          <DurationIcon size={12} />
                        </div>
                        <span className="font-bold text-foreground">1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{ color: "#a78bfa" }}>◄</span>
                        <span className="font-bold text-foreground">0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DurationIcon size={12} className="text-muted-foreground/70" />
                        <span className="font-bold text-foreground">1h30m</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="font-bold text-foreground">90</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-bold text-foreground">168</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Events Section */}
              <div className="flex-1 flex items-center p-2 gap-2 overflow-x-auto">
                {/* Event Card 1 */}
                <div className="flex-shrink-0 w-64 rounded-xl border border-border bg-background overflow-hidden opacity-75">
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl font-black text-foreground leading-none">16:30</p>
                        <p className="text-xs text-muted-foreground font-bold mt-0.5">START +1h30m</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 font-bold">⊳</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 text-xs font-bold">Bob Wilson</span>
                        <span className="text-xs bg-foreground/5 px-1.5 py-0.5 rounded text-muted-foreground font-bold">+1</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        <span className="font-bold">Gym B</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Timeline Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Event Timeline</h2>
            <p className="text-muted-foreground text-sm">Compact view of the day's schedule</p>
          </div>

          {/* Timeline Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Teacher Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="rounded-2xl bg-card border border-border p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <HeadsetIcon size={24} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">john_smith</p>
                  <p className="text-xs text-muted-foreground font-mono">14:30</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">1/2 Completed</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-green-600" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50 flex-wrap text-xs">
                <div className="flex items-center gap-1">
                  <div style={{ color: "#a78bfa" }}>
                    <DurationIcon size={14} />
                  </div>
                  <span className="font-bold text-foreground">1</span>
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ color: "#a78bfa" }}>◄</span>
                  <span className="font-bold text-foreground">1</span>
                </div>
                <div className="flex items-center gap-1">
                  <DurationIcon size={14} className="text-muted-foreground/70" />
                  <span className="font-bold text-foreground">3h30m</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <span className="font-bold text-foreground">210</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-bold text-foreground">840</span>
                </div>
              </div>
            </motion.div>

            {/* Event Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl bg-card border border-border p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-black text-foreground leading-none">14:30</p>
                  <p className="text-xs text-muted-foreground font-bold mt-1">START +2h</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <div style={{ color: "#a78bfa" }}>
                    <DurationIcon size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-700 text-xs font-bold">
                    Alice Johnson
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={14} />
                  <span className="font-bold">Gym A</span>
                </div>
              </div>
            </motion.div>

            {/* Event Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="rounded-2xl bg-card border border-border p-4 space-y-3 opacity-75"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-black text-foreground leading-none">16:30</p>
                  <p className="text-xs text-muted-foreground font-bold mt-1">START +1h30m</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">▶</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-700 text-xs font-bold">
                    Bob Wilson
                  </span>
                  <span className="text-xs bg-foreground/5 px-1.5 py-0.5 rounded text-muted-foreground font-bold">+1</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={14} />
                  <span className="font-bold">Gym B</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* What You See */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="pt-6 border-t border-border/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">See</p>
              <p className="text-sm text-foreground">All lessons grouped by date</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Track</p>
              <p className="text-sm text-foreground">Real-time event status & completion</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Manage</p>
              <p className="text-sm text-foreground">Equipment, commissions & payments</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
