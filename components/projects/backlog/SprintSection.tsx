"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Calendar, Plus, User } from "lucide-react";

interface Task {
    id: string;
    title: string;
    priority: string;
    status: string;
    story_points?: number;
    assignee?: any;
    task_type?: "story" | "bug" | "task" | "epic";
    sprint_id?: string;
    column_id?: string;
}

interface Sprint {
    id: string;
    name: string;
    status: "active" | "future" | "closed";
    start_date?: string;
    end_date?: string;
    project_id?: string;
}

interface SprintSectionProps {
    sprint: Sprint;
    tasks: Task[];
    onStartSprint?: (id: string) => void;
    onCompleteSprint?: (id: string) => void;
    onEditSprint?: (id: string) => void;
    onMoveTask?: (taskId: string, sprintId: string) => void;
    onCreateTask?: () => void;
    onTaskClick?: (task: Task) => void;
}

export default function SprintSection({ sprint, tasks, onStartSprint, onCompleteSprint, onEditSprint, onCreateTask, onTaskClick }: SprintSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const totalPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const taskCount = tasks.length;

    const formatDateRange = (start?: string, end?: string) => {
        if (!start || !end) return "";
        const s = new Date(start);
        const e = new Date(end);
        return `${s.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{sprint.name}</h3>
                        <span className="text-xs text-slate-500 hidden sm:inline-block">
                            {formatDateRange(sprint.start_date, sprint.end_date)} {sprint.status === 'active' && <span className="text-emerald-600 font-medium ml-2">(Active)</span>}
                        </span>
                        <span className="text-xs text-slate-400">({taskCount} issues)</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-300 dark:bg-slate-600 rounded-full text-[10px]">{totalPoints}</span>
                        <span>Estimate</span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {sprint.status === 'future' && (
                            <button
                                onClick={() => onStartSprint?.(sprint.id)}
                                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-semibold rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                Start sprint
                            </button>
                        )}
                        {sprint.status === 'active' && (
                            <button
                                onClick={() => onCompleteSprint?.(sprint.id)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-medium rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Complete sprint
                            </button>
                        )}
                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Task List */}
            {isExpanded && (
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 min-h-[50px]">
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 border-b border-t border-dashed border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 text-xs text-dashed">
                            Plan a sprint by dragging work items here
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900">
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Task Type Icon */}
                                        <div className="flex-shrink-0" title={task.task_type || "story"}>
                                            {task.task_type === 'bug' ? (
                                                <div className="w-4 h-4 rounded-sm bg-red-500 flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                                            ) : task.task_type === 'epic' ? (
                                                <div className="w-4 h-4 rounded-sm bg-purple-500 flex items-center justify-center shadow-sm"><div className="w-1.5 h-2.5 bg-white rounded-[1px]"></div></div>
                                            ) : task.task_type === 'task' ? (
                                                <div className="w-4 h-4 rounded-sm bg-blue-500 flex items-center justify-center shadow-sm"><div className="w-2.5 h-2.5 bg-white rounded-[1px]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div></div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-sm bg-emerald-500 flex items-center justify-center shadow-sm"><div className="w-1.5 h-2 bg-white rounded-[1px]"></div></div> // Story
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Key would go here e.g. TRC-123 */}
                                            {/* <span className="text-xs text-slate-400 font-mono">TRC-{task.id.slice(0,3)}</span> */}
                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 flex-shrink-0">
                                        <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border opacity-80
                                            ${task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                                task.priority === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {task.priority || "Med"}
                                        </div>

                                        {task.assignee ? (
                                            <div title={task.assignee.full_name} className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-white dark:border-slate-600 ring-1 ring-slate-100 dark:ring-slate-800">
                                                {task.assignee.avatar_url ? (
                                                    <img src={task.assignee.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-xs font-bold">
                                                        {(task.assignee.full_name?.[0] || "U")}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-transparent border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                                <User className="text-slate-300 dark:text-slate-600" size={12} />
                                            </div>
                                        )}

                                        <div className="w-6 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {task.story_points || "-"}
                                        </div>

                                        <button className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="bg-white dark:bg-slate-900 border-b border-l border-r border-slate-200 dark:border-slate-800 rounded-b-lg">
                        <button className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 pl-4 w-full text-left transition-colors">
                            <Plus size={14} />
                            <span className="font-semibold">Create issue</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
