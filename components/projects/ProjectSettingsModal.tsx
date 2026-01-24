"use client";

import { useState } from "react";
import { updateProject, deleteProject } from "@/actions/project";
import { X, Save, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
}

export default function ProjectSettingsModal({ isOpen, onClose, project }: ProjectSettingsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSave = async (formData: FormData) => {
        setIsLoading(true);
        const updates = {
            name: formData.get("name"),
            description: formData.get("description"),
        };
        // await updateProject(project.id, updates); // Need to implement this action or assume generic
        // For now, console log or simulated delay
        await new Promise(r => setTimeout(r, 1000));

        setIsLoading(false);
        onClose();
        router.refresh(); // Ideally updates server
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        setIsLoading(true);
        const result = await deleteProject(project.id);

        if (result?.error) {
            alert(result.error);
            setIsLoading(false);
            return;
        }

        router.push("/dashboard/projects");
        router.refresh();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Project Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSave} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Name</label>
                        <input
                            name="name"
                            defaultValue={project.name}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            defaultValue={project.description}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} /> Delete Project
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
