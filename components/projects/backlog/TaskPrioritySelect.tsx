"use client";

import { useState, useRef, useEffect } from "react";
import { updateTask } from "@/actions/tasks";

interface TaskPrioritySelectProps {
    task: any;
    onUpdate?: () => void;
}

export default function TaskPrioritySelect({ task, onUpdate }: TaskPrioritySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [priority, setPriority] = useState<string>(task.priority || "Medium");
    const menuRef = useRef<HTMLDivElement>(null);

    const priorities = ["Low", "Medium", "High", "Urgent"];

    useEffect(() => {
        setPriority(task.priority || "Medium");
    }, [task.priority]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (value: string) => {
        setPriority(value);
        setIsOpen(false);
        await updateTask(task.id, { priority: value });
        if (onUpdate) onUpdate();
    };

    const getColors = (p: string) => {
        switch (p) {
            case "High": return "bg-red-50 text-red-600 border-red-100";
            case "Urgent": return "bg-red-100 text-red-700 border-red-200";
            case "Low": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-amber-50 text-amber-600 border-amber-100";
        }
    };

    return (
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border opacity-80 hover:opacity-100 transition-opacity ${getColors(priority)}`}
            >
                {priority}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-24 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-1 flex flex-col gap-1">
                    {priorities.map(p => (
                        <button
                            key={p}
                            onClick={() => handleSelect(p)}
                            className={`text-left px-2 py-1 text-xs font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-800 ${priority === p ? "text-indigo-600" : "text-slate-600 dark:text-slate-300"}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
