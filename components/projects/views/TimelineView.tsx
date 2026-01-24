"use client";

import { useState } from "react";
import TaskDetailsModal from "../TaskDetailsModal";

interface TimelineViewProps {
    tasks: any[];
    columns: any[];
    members: any[];
}

export default function TimelineView({ tasks, columns, members }: TimelineViewProps) {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    // Mock timeline range (current month)
    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <>
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <div className="w-64 flex-shrink-0 p-4 border-r border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-500 bg-slate-50 dark:bg-slate-950">
                        Task Name
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                        {days.map(d => (
                            <div key={d} className="flex-1 min-w-[40px] border-r border-slate-100 dark:border-slate-800 text-center py-2 text-xs text-slate-400">
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tasks.map(task => {
                        // Very rough positioning logic for demo
                        // In real app, calculate offset based on start/due dates vs viewport start date
                        const randomStart = Math.floor(Math.random() * 10);
                        const duration = Math.max(2, Math.floor(Math.random() * 10));

                        return (
                            <div key={task.id} className="flex border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="w-64 flex-shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex items-center">
                                    {task.title}
                                </div>
                                <div className="flex-1 relative h-10">
                                    <div
                                        onClick={() => setSelectedTask(task)}
                                        className="absolute top-2 h-6 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-colors border border-indigo-400 cursor-pointer shadow-sm opacity-90"
                                        style={{
                                            left: `${randomStart * 3.33}%`, // Example
                                            width: `${duration * 3.33}%`
                                        }}
                                        title={`Due: ${task.due_date || 'No date'}`}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <TaskDetailsModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                columns={columns}
                members={members}
            />
        </>
    );
}
