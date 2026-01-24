"use client";

import { useState } from "react";
import { updateTask } from "@/actions/tasks";
import { X, Loader2, Calendar, User, Save, Trash2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: string;
    column_id: string;
    assignee_id?: string;
    status?: string;
    due_date?: string | null;
}

interface Member {
    id: string;
    userId: string;
    name: string;
    avatar?: string;
}

interface Column {
    id: string;
    name: string;
}

interface TaskDetailsModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    columns: Column[];
    members: Member[];
}

export default function TaskDetailsModal({ task, isOpen, onClose, columns, members }: TaskDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (!isOpen || !task) return null;

    const handleSave = async (formData: FormData) => {
        setIsLoading(true);
        // Gather all updates
        const updates = {
            title: formData.get("title"),
            description: formData.get("description"),
            priority: formData.get("priority"),
            column_id: formData.get("columnId"),
            assignee_id: formData.get("assigneeId") || null,
            due_date: formData.get("dueDate") || null,
        };

        await updateTask(task.id, updates);
        setIsLoading(false);
        router.refresh();
        onClose();
    };

    // Format date for input value (YYYY-MM-DD)
    const defaultDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm font-mono">TASK-{task.id.slice(0, 4).toUpperCase()}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSave} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Task Title</label>
                            <input
                                name="title"
                                defaultValue={task.title}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 dark:text-slate-200 text-lg"
                                placeholder="Task Title"
                            />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800/50">
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Status</label>
                                <div className="relative">
                                    <select name="columnId" defaultValue={task.column_id} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-10 py-2.5 outline-none appearance-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 dark:text-slate-200 text-sm cursor-pointer">
                                        {columns.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Priority</label>
                                <div className="relative">
                                    <select name="priority" defaultValue={task.priority} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-10 py-2.5 outline-none appearance-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 dark:text-slate-200 text-sm cursor-pointer">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Assignee</label>
                                <div className="relative">
                                    <select name="assigneeId" defaultValue={task.assignee_id || ""} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-10 py-2.5 outline-none appearance-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 dark:text-slate-200 text-sm cursor-pointer">
                                        <option value="">Unassigned</option>
                                        {members.map(m => (
                                            <option key={m.userId} value={m.userId}>{m.name}</option>
                                        ))}
                                    </select>
                                    <User className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Due Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="dueDate"
                                        defaultValue={defaultDate}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 dark:text-slate-200 text-sm"
                                    />
                                    <Calendar className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
                            <textarea
                                name="description"
                                defaultValue={task.description || ""}
                                placeholder="Add a description..."
                                className="w-full min-h-[150px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
