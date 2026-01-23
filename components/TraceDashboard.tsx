"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Settings,
    Layout,
    List,
    CheckCircle2,
    Circle,
    Clock,
    MoreHorizontal,
    Send,
    Sparkles,
    Search,
    Calendar,
    FolderKanban
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createProject } from "@/actions/project";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---

type TaskStatus = "To Do" | "In Progress" | "Done";
type Priority = "Low" | "Medium" | "High";

interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    due_date: string | null;
    assignee_id: string | null;
    project_id: string;
}

interface Project {
    id: string;
    name: string;
    key: string;
}

const TaskCard = ({ task }: { task: Task }) => {
    return (
        <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                    task.priority === "High" ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" :
                        task.priority === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30" :
                            "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                )}>
                    {task.priority}
                </span>
            </div>
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">{task.title}</h3>
        </div>
    );
};

export default function TraceDashboard() {
    const [view, setView] = useState<"table" | "kanban">("table");
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (activeProjectId) {
            fetchTasks(activeProjectId);
        }
    }, [activeProjectId]);

    const fetchProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get org via member
        const { data: member } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).single();
        if (!member) return;

        const { data } = await supabase.from("projects").select("*").eq("organization_id", member.organization_id);
        if (data && data.length > 0) {
            setProjects(data);
            setActiveProjectId(data[0].id);
        }
    };

    const fetchTasks = async (projectId: string) => {
        const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
        if (data) setTasks(data as Task[]);
    };

    const handleCreateProject = async (formData: FormData) => {
        await createProject(formData);
        setIsCreatingProject(false);
        fetchProjects(); // Refresh list
    };

    const handleIntent = async () => {
        if (!input.trim() || !activeProjectId) return;
        setIsProcessing(true);

        const tempId = Math.random().toString();
        const tempTask: Task = {
            id: tempId,
            title: input,
            status: "To Do",
            priority: "Medium",
            due_date: null,
            assignee_id: null,
            project_id: activeProjectId
        };
        setTasks(prev => [tempTask, ...prev]);
        setInput("");

        // Simulate AI parsing for now (using mocked logic to ensure it works without API keys configured nicely)
        // In real app, call OpenAI here.
        const { error } = await supabase.from("tasks").insert({
            title: tempTask.title,
            status: "To Do",
            priority: "Medium",
            project_id: activeProjectId
        });

        if (error) {
            console.error(error);
            setTasks(prev => prev.filter(t => t.id !== tempId));
            alert("Failed to create task");
        }

        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen pb-32 pt-20 px-4 md:px-8 max-w-7xl mx-auto">

            {/* Project Modal */}
            {isCreatingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-semibold mb-4">New Project</h3>
                        <form action={handleCreateProject} className="space-y-4">
                            <input name="name" placeholder="Project Name" className="w-full p-2 border rounded-lg dark:bg-slate-800" required />
                            <input name="key" placeholder="Key (e.g. WEB)" className="w-full p-2 border rounded-lg dark:bg-slate-800" />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreatingProject(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-4">
                    <div className="ml-12 md:ml-0 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                        <span className="font-semibold text-lg hidden md:block">Trace</span>
                    </div>

                    {/* Project Selector */}
                    <div className="flex items-center gap-2 ml-4">
                        <select
                            value={activeProjectId || ""}
                            onChange={(e) => setActiveProjectId(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm font-medium outline-none"
                        >
                            {projects.length === 0 && <option>No Projects</option>}
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={() => setIsCreatingProject(true)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setView("table")}
                        className={cn("p-1.5 rounded-md transition-all", view === "table" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500")}
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setView("kanban")}
                        className={cn("p-1.5 rounded-md transition-all", view === "kanban" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-500")}
                    >
                        <Layout size={18} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="mt-6">
                {!activeProjectId ? (
                    <div className="text-center py-20">
                        <FolderKanban className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">No Projects Found</h3>
                        <p className="text-slate-500 mb-6">Create your first project to start tracking tasks.</p>
                        <button onClick={() => setIsCreatingProject(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create Project</button>
                    </div>
                ) : view === "table" ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 w-32">Status</th>
                                    <th className="px-6 py-4 w-32 hidden sm:table-cell">Priority</th>
                                    <th className="px-6 py-4 w-40 hidden md:table-cell">Due Date</th>
                                    <th className="px-6 py-4 w-40 hidden lg:table-cell">Assignee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {tasks.map(task => (
                                    <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{task.title}</td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                                task.status === "Done" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30" :
                                                    task.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30" :
                                                        "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                            )}>
                                                {task.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={cn(
                                                " text-xs font-medium",
                                                task.priority === "High" ? "text-red-500" :
                                                    task.priority === "Medium" ? "text-amber-500" : "text-slate-400"
                                            )}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 hidden md:table-cell">-</td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-slate-400 italic">Unassigned</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
                        {(["To Do", "In Progress", "Done"] as TaskStatus[]).map(status => (
                            <div key={status} className="min-w-[300px] w-[320px] shrink-0 snap-center">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">{status}</h3>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-500 font-medium">
                                        {tasks.filter(t => t.status === status).length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Omnibar */}
            {activeProjectId && (
                <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[600px] z-50">
                    <div className={cn(
                        "glass rounded-2xl p-2 pl-4 flex items-center gap-3 shadow-2xl transition-all border border-indigo-100/50 dark:border-indigo-900/30",
                        isProcessing && "animate-pulse"
                    )}>
                        <div className="bg-indigo-600/10 p-2 rounded-lg">
                            <Sparkles className="text-indigo-600" size={20} />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleIntent()}
                            placeholder="What is your intention? (e.g., 'Update homepage banner')"
                            className={cn(
                                "bg-transparent flex-1 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                            )}
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleIntent}
                            disabled={!input.trim() || isProcessing}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
