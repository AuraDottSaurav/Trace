"use client";

import { useState } from "react";
import { User, Calendar, Circle, Search } from "lucide-react";
import TaskDetailsModal from "../TaskDetailsModal";
import MemberFilter from "../MemberFilter";

interface ListViewProps {
    tasks: any[];
    columns: any[];
    members: any[];
}

export default function ListView({ tasks, columns, members }: ListViewProps) {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMemberFilter, setActiveMemberFilter] = useState<string | null>(null);

    const getColumnName = (colId: string) => columns.find(c => c.id === colId)?.name || "Unknown";
    const getMember = (userId: string) => members.find(m => m.userId === userId);

    const toggleMemberFilter = (memberId: string) => {
        setActiveMemberFilter(current => current === memberId ? null : memberId);
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMember = activeMemberFilter === null
            ? true
            : activeMemberFilter === "unassigned"
                ? !t.assignee_id
                : t.assignee_id === activeMemberFilter;
        return matchesSearch && matchesMember;
    });

    return (
        <>
            <div className="h-full overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search tasks"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 transition-shadow"
                            />
                        </div>
                        <MemberFilter members={members} activeFilter={activeMemberFilter} onToggle={toggleMemberFilter} />
                    </div>
                </div>

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
                    {filteredTasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No tasks found</div>
                    ) : (
                        filteredTasks.map((task) => {
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
