"use client";

import { Plus, Edit, MoreHorizontal, Check } from "lucide-react";

interface ChecklistItem {
    task: string;
    completed: boolean;
}

interface BookKeepingTask {
    id: number;
    room: string;
    type: string;
    assignedTo: string;
    status: "pending" | "in-progress" | "completed";
    priority: "low" | "medium" | "high";
    estimatedTime: string;
    notes?: string;
    checklist: ChecklistItem[];
}

interface BookKeepingProps {
    tasks: BookKeepingTask[];
    title?: string;
    onAssignTask?: () => void;
    onEditTask?: (taskId: number) => void;
    onMoreActions?: (taskId: number) => void;
    className?: string;
}

export default function BookKeeping({ tasks, title = "Housekeeping Tasks", onAssignTask, onEditTask, onMoreActions, className = "" }: BookKeepingProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-destructive/20 text-destructive";
            case "medium":
                return "bg-warning/20 text-warning";
            case "low":
                return "bg-secondary/20 text-secondary";
            default:
                return "bg-muted/20 text-muted-foreground";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-secondary/20 text-secondary";
            case "in-progress":
                return "bg-primary/20 text-primary";
            case "pending":
                return "bg-muted/20 text-muted-foreground";
            default:
                return "bg-muted/20 text-muted-foreground";
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                    <div className="text-2xl font-bold text-foreground mb-2">{tasks.filter((t) => t.status === "pending").length}</div>
                    <p className="text-sm text-muted-foreground">Pending Tasks</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                    <div className="text-2xl font-bold text-foreground mb-2">{tasks.filter((t) => t.status === "in-progress").length}</div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                    <div className="text-2xl font-bold text-foreground mb-2">{tasks.filter((t) => t.status === "completed").length}</div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                    <div className="text-2xl font-bold text-foreground mb-2">{tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100) : 0}%</div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                        {onAssignTask && (
                            <button onClick={onAssignTask} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                <Plus size={16} />
                                Assign Task
                            </button>
                        )}
                    </div>
                </div>
                <div className="divide-y divide-border">
                    {tasks.map((task) => (
                        <div key={task.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-semibold text-foreground">Room {task.room}</h5>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>{task.priority} priority</span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                                    </div>
                                    <p className="text-muted-foreground mb-1">{task.type}</p>
                                    <p className="text-sm text-muted-foreground">Assigned to: {task.assignedTo}</p>
                                    <p className="text-sm text-muted-foreground">Estimated time: {task.estimatedTime}</p>
                                    {task.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {task.notes}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    {onEditTask && (
                                        <button onClick={() => onEditTask(task.id)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {onMoreActions && (
                                        <button onClick={() => onMoreActions(task.id)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h6 className="font-medium text-foreground">Checklist:</h6>
                                {task.checklist.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${item.completed ? "bg-secondary border-secondary" : "border-muted"}`}>{item.completed && <Check size={12} className="text-white" />}</div>
                                        <span className={`text-sm ${item.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.task}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Progress: {task.checklist.filter((item) => item.completed).length}/{task.checklist.length} completed
                                </div>
                                <div className="w-32 bg-muted rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(task.checklist.filter((item) => item.completed).length / task.checklist.length) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && <div className="p-6 text-center text-muted-foreground">No tasks assigned yet.</div>}
                </div>
            </div>
        </div>
    );
}
