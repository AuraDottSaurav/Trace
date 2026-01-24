"use client";

import { useState } from "react";
import { createTask } from "@/actions/tasks";
import { X, Sparkles, Loader2, Calendar, User, ChevronDown } from "lucide-react";

interface Column {
    id: string;
    name: string;
}

interface Member {
    id: string;
    userId: string;
    name: string;
    avatar?: string;
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    columns: Column[];
    members?: Member[];
    defaultColumnId?: string;
}

export default function CreateTaskModal({ isOpen, onClose, projectId, columns, members = [], defaultColumnId }: CreateTaskModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">New Task</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form
                    action={async (formData) => {
                        setIsLoading(true);
                        await createTask(projectId, formData);
                        setIsLoading(false);
                        onClose();
                    }}
                    className="p-6 space-y-5"
                >
                    {/* Task Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Task Title</label>
                        <input
                            name="title"
                            required
                            placeholder="e.g. Redesign Landing Page"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800 dark:text-slate-100"
                            autoFocus
                        />
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <div className="flex gap-2 flex-wrap">
                            {columns.map((col, idx) => (
                                <label key={col.id} className="cursor-pointer">
                                    <input type="radio" name="columnId" value={col.id} className="peer sr-only" defaultChecked={defaultColumnId ? col.id === defaultColumnId : idx === 0} />
                                    <span className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm font-medium peer-checked:bg-indigo-50 peer-checked:border-indigo-200 peer-checked:text-indigo-600 dark:peer-checked:bg-indigo-900/20 dark:peer-checked:border-indigo-900/50 dark:peer-checked:text-indigo-400 transition-all">
                                        {col.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                            <div className="relative">
                                <select name="priority" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer">
                                    <option value="Low">Low</option>
                                    <option value="Medium" defaultChecked>Medium</option>
                                    <option value="High">High</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        {/* Assignee */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assignee</label>
                            <div className="relative">
                                <select name="assigneeId" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer">
                                    <option value="">Unassigned</option>
                                    {members.map(member => (
                                        <option key={member.userId || member.id} value={member.userId}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                <User className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="dueDate"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300 appearance-none"
                            />
                            <Calendar className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            placeholder="Add details about this task..."
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
