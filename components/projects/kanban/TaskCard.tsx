"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// Remove Lucide import if no longer used directly in this file, but MoreHorizontal is inside Menu now.
import TaskActionsMenu from "./TaskActionsMenu";
import { Calendar, AlignLeft, CheckSquare } from "lucide-react";

interface Task {
    id: string;
    title: string;
    priority: "Low" | "Medium" | "High";
    column_id: string;
    description?: string;
    due_date?: string | null;
    assignee?: {
        full_name: string;
        avatar_url?: string;
        email: string;
    };
}

export default function TaskCard({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-2 border-indigo-500 opacity-50 h-[120px] shadow-xl rotate-2 scale-105"
            />
        );
    }

    const priorityColors = {
        High: "from-red-500 to-rose-500",
        Medium: "from-amber-400 to-orange-500",
        Low: "from-emerald-400 to-green-500"
    };

    const priorityBg = {
        High: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
        Medium: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
        Low: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
        default: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden"
        >
            {/* Left accent border based on priority */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${priorityColors[task.priority] || "from-slate-400 to-slate-500"}`} />

            <div className="flex justify-between items-start mb-2 pl-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${priorityBg[task.priority] || priorityBg.default
                    }`}>
                    {task.priority || "Medium"}
                </span>
                <div onPointerDown={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <TaskActionsMenu taskId={task.id} />
                </div>
            </div>

            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug mb-2 pl-2 line-clamp-2">
                {task.title}
            </h3>

            {(task.assignee || task.due_date) && (
                <div className="flex items-center justify-between pl-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        {/* Assignee Avatar */}
                        {task.assignee && (
                            <div className="flex items-center" title={task.assignee.full_name || "Unassigned"}>
                                {task.assignee.avatar_url ? (
                                    <img src={task.assignee.avatar_url} alt="" className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[9px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                        {(task.assignee.full_name || task.assignee.email || "?")[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Due Date */}
                        {task.due_date && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                <Calendar size={10} />
                                <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
