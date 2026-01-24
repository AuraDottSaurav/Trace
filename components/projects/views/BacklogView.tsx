"use client";

import { useState } from "react";
import SprintSection from "../backlog/SprintSection";
import { Plus, Search, Filter, SlidersHorizontal, ChevronDown } from "lucide-react";
import { createSprint } from "@/actions/sprints";

interface BacklogViewProps {
    tasks: any[];
    sprints: any[];
    projectId: string;
    onCreateTask: (sprintId?: string) => void;
    onTaskClick: (task: any) => void;
}

export default function BacklogView({ tasks, sprints, projectId, onCreateTask, onTaskClick }: BacklogViewProps) {
    const [isCreatingSprint, setIsCreatingSprint] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter tasks based on search
    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.task_type && t.task_type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Group tasks by sprint
    const tasksBySprint = filteredTasks.reduce((acc, task) => {
        const key = task.sprint_id || "backlog";
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {} as Record<string, typeof filteredTasks>);

    // Sort sprints: Active first, then Future by date
    const sortedSprints = [...sprints].sort((a, b) => {
        if (a.status === 'active') return -1;
        if (b.status === 'active') return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const backlogTasks = tasksBySprint["backlog"] || [];

    const handleCreateSprint = async () => {
        setIsCreatingSprint(true);
        const name = `Sprint ${sprints.length + 1}`;
        await createSprint(projectId, name);
        setIsCreatingSprint(false);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-950">
            {/* Toolbar / Filters */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
                <div className="flex items-center gap-3 w-full max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search backlog"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 transition-shadow"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateSprint}
                        disabled={isCreatingSprint}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isCreatingSprint ? "Creating..." : "Create sprint"}
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-slate-500 font-medium">
                            {filteredTasks.length} issues
                        </div>
                    </div>

                    {/* Sprints Sections */}
                    {sortedSprints.map(sprint => (
                        <SprintSection
                            key={sprint.id}
                            sprint={sprint}
                            tasks={tasksBySprint[sprint.id] || []}
                            onCreateTask={() => onCreateTask(sprint.id)}
                            onTaskClick={onTaskClick}
                        />
                    ))}

                    {/* Backlog Section */}
                    {/* If we have sprints, Backlog is separated visually. If no sprints, it's just the main list */}
                    <SprintSection
                        sprint={{ id: "backlog", name: "Backlog", status: "future" } as any}
                        tasks={backlogTasks}
                        onCreateTask={() => onCreateTask(undefined)} // Backlog has no sprint ID (or null)
                        onTaskClick={onTaskClick}
                    />
                </div>
            </div>
        </div>
    );
}
