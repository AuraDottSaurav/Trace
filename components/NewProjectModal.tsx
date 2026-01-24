"use client";

import { useState } from "react";
import { createProject } from "@/actions/project";
import { X, Sparkles, Loader2 } from "lucide-react";

export default function NewProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Create Project</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form
                    action={async (formData) => {
                        setIsLoading(true);
                        await createProject(formData);
                        setIsLoading(false);
                        onClose();
                    }}
                    className="p-6 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                        <input
                            name="name"
                            required
                            placeholder="e.g. Website Redesign"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Key (Optional)</label>
                        <input
                            name="key"
                            placeholder="e.g. WEB"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase"
                            maxLength={5}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            placeholder="What is this project about?"
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
                            {isLoading ? "Creating..." : "Create with AI Magic"}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-3">
                            AI will automatically generate tasks based on description later.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
