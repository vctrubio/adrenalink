import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import type { GlobalStats } from "@/backend/ClassboardStats";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import { getPrettyDuration } from "@/getters/duration-getter";
import { bulkUpdateClassboardEvents, bulkDeleteClassboardEvents, deleteUncompletedClassboardEvents } from "@/actions/classboard-bulk-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

interface StatsWithBulkProps {
    stats: GlobalStats;
    teacherQueues: TeacherQueue[];
}

export default function StatsWithBulk({ stats, teacherQueues }: StatsWithBulkProps) {
    // Collect all event IDs from teacher queues
    const allEvents = teacherQueues.flatMap((queue) => queue.getAllEvents());
    const allEventIds = allEvents.map((e) => e.eventData.id).filter((id): id is string => id !== null);

    const eventsByStatus = {
        planned: allEvents.filter((e) => e.eventData.status === "planned"),
        tbc: allEvents.filter((e) => e.eventData.status === "tbc"),
        completed: allEvents.filter((e) => e.eventData.status === "completed"),
        uncompleted: allEvents.filter((e) => e.eventData.status !== "completed"),
    };

    const handleBulkAction = async (action: string) => {
        try {
            switch (action) {
                case "complete-all":
                    const completeResult = await bulkUpdateClassboardEvents(allEventIds, "completed");
                    if (completeResult.success) {
                        console.log(`✅ Completed ${completeResult.data.updatedCount} events`);
                    }
                    break;
                case "plan-all":
                    const planResult = await bulkUpdateClassboardEvents(allEventIds, "planned");
                    if (planResult.success) {
                        console.log(`✅ Set ${planResult.data.updatedCount} events to planned`);
                    }
                    break;
                case "tbc-all":
                    const tbcResult = await bulkUpdateClassboardEvents(allEventIds, "tbc");
                    if (tbcResult.success) {
                        console.log(`✅ Set ${tbcResult.data.updatedCount} events to TBC`);
                    }
                    break;
                case "delete-all":
                    const deleteResult = await bulkDeleteClassboardEvents(allEventIds);
                    if (deleteResult.success) {
                        console.log(`✅ Deleted ${deleteResult.data.deletedCount} events`);
                    }
                    break;
                case "delete-uncompleted":
                    const uncompletedIds = eventsByStatus.uncompleted.map((e) => e.eventData.id).filter((id): id is string => id !== null);
                    const deleteUncompletedResult = await deleteUncompletedClassboardEvents(uncompletedIds);
                    if (deleteUncompletedResult.success) {
                        console.log(`✅ Deleted ${deleteUncompletedResult.data.deletedCount} uncompleted events`);
                    }
                    break;
            }
        } catch (error) {
            console.error("❌ Error performing bulk action:", error);
        }
    };

    const teacherCount = teacherQueues.length;
    const completedCount = eventsByStatus.completed.length;
    const totalEvents = stats.totalEvents;

    return (
        <div className="space-y-3">
            {/* Completed Count with Bulk Actions Dropdown */}
            <div className="flex items-center justify-end">
                {/* Bulk Actions Dropdown */}
                <Menu as="div" className="relative">
                    <Menu.Button
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${completedCount === totalEvents && totalEvents > 0 ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        <span className="font-medium">
                            {completedCount}/{totalEvents}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                        <div className="p-1">
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">Update All Events</div>
                            <Menu.Item>
                                {({ active }) => (
                                    <button onClick={() => handleBulkAction("complete-all")} className={`${active ? "bg-muted/50" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}>
                                        Set All to Completed
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button onClick={() => handleBulkAction("plan-all")} className={`${active ? "bg-muted/50" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}>
                                        Set All to Planned
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button onClick={() => handleBulkAction("tbc-all")} className={`${active ? "bg-muted/50" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-purple-600 dark:text-purple-400`}>
                                        Set All to TBC
                                    </button>
                                )}
                            </Menu.Item>

                            <div className="my-1 border-t border-border" />

                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Delete Events</div>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => handleBulkAction("delete-uncompleted")}
                                        disabled={eventsByStatus.uncompleted.length === 0}
                                        className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50`}
                                    >
                                        <span>Delete Uncompleted</span>
                                        <span className="text-xs">({eventsByStatus.uncompleted.length})</span>
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => handleBulkAction("delete-all")}
                                        disabled={allEventIds.length === 0}
                                        className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-red-700 dark:text-red-300 disabled:opacity-50`}
                                    >
                                        <span>Delete All</span>
                                        <span className="text-xs">({allEventIds.length})</span>
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Menu>
            </div>

            {/* Stats Grid - Row 1: Teachers, Events, Students */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                    <FlagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold">{stats.totalEvents}</span>
                </div>{" "}
                <div className="flex items-center gap-2">
                    <HeadsetIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">{teacherCount}</span>
                </div>
                <div className="flex items-center gap-2">
                    <HelmetIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">{stats.totalStudents}</span>
                </div>
            </div>

            {/* Stats Grid - Row 2: Duration, Teacher Commission, School */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                    <DurationIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold">{getPrettyDuration(stats.totalHours * 60)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <HandshakeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">€{Math.round(stats.totalEarnings.teacher)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <BankIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold">€{Math.round(stats.totalEarnings.school)}</span>
                </div>
            </div>
        </div>
    );
}
