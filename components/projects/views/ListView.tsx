"use client";

import { useState } from "react";
import { User, Calendar, Circle } from "lucide-react";
import TaskDetailsModal from "../TaskDetailsModal";

interface ListViewProps {
    tasks: any[];
    columns: any[];
    members: any[];
}

export default function ListView({ tasks, columns, members }: ListViewProps) {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const getColumnName = (colId: string) => columns.find(c => c.id === colId)?.name || "Unknown";
    const getMember = (userId: string) => members.find(m => m.userId === userId);

    return (
        <>
            <div className="h-full overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-4 pl-2">Task</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Priority</div>
                    <div className="col-span-2">Assignee</div>
                    <div className="col-span-2">Due Date</div>
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-y-auto">
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No tasks found</div>
                    ) : (
                        tasks.map((task) => {
                            const assignee = getMember(task.assignee_id);
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group items-center"
                                >
                                    <div className="col-span-4 font-medium text-slate-800 dark:text-slate-200 pl-2">
                                        {task.title}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {getColumnName(task.column_id)}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${task.priority === "High" ? "bg-red-50 text-red-600 border-red-100" :
                                            task.priority === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            }`}>
                                            {task.priority || "Medium"}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        {assignee ? (
                                            <>
                                                {assignee.avatar ? (
                                                    <img src={assignee.avatar} className="w-6 h-6 rounded-full" alt="" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                        {assignee.name[0]}
                                                    </div>
                                                )}
                                                <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{assignee.name}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-slate-400 flex items-center gap-1.5"><User size={14} /> Unassigned</span>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-sm text-slate-500 flex items-center gap-2">
                                        {task.due_date ? (
                                            <>
                                                <Calendar size={14} />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </>
                                        ) : (
                                            <span className="opacity-50">-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
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
