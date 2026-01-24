"use client";

import { useState } from "react";
import { Users, Settings, Plus } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";

interface ProjectHeaderProps {
    projectId: string;
    onCreateTask: () => void;
    onInvite: () => void;
    onSettings: () => void;
}

export default function ProjectHeader({ projectId, onCreateTask, onInvite, onSettings }: ProjectHeaderProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onInvite}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                title="Manage Team"
            >
                <Users size={20} />
            </button>
            <button
                onClick={onSettings}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                title="Project Settings"
            >
                <Settings size={20} />
            </button>
            <button
                onClick={onCreateTask}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
                <Plus size={18} />
                <span>Create Task</span>
            </button>
        </div>
    );
}
