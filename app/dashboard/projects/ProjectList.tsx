"use client";

import { useState } from "react";
import NewProjectModal from "@/components/NewProjectModal";
import { Plus, Search, FolderGit2, Calendar, MoreHorizontal } from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string | null;
    key: string | null;
    created_at: string;
}

export default function ProjectList({ projects }: { projects: Project[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Projects</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your ongoing initiatives</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">New Project</span>
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <FolderGit2 className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No projects yet</h3>
                    <p className="text-slate-500 text-sm max-w-xs text-center mt-2 mb-6">get started by creating your first project and let AI verify your plan.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                        Create your first project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 rounded-2xl p-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden">
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded-md text-slate-500 uppercase tracking-wider">
                                        {project.key || project.name.slice(0, 3).toUpperCase()}
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 truncate pr-2">
                                    {project.name}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 h-10 mb-6">
                                    {project.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={14} />
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
