"use client";

import { useState, useRef, useEffect } from "react";
import { updateTask, updateTaskColumn } from "@/actions/tasks";
import { Circle, CheckCircle2, Clock, PlayCircle } from "lucide-react";

interface TaskStatusSelectProps {
    task: any;
    columns?: any[];
    onUpdate?: () => void;
}

export default function TaskStatusSelect({ task, columns, onUpdate }: TaskStatusSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Use column_id instead of status if we have columns
    const initialStatus = columns ? (task.column_id || columns[0]?.id) : (task.status || "todo");
    const [statusId, setStatusId] = useState<string>(initialStatus);
    const menuRef = useRef<HTMLDivElement>(null);

    const defaultStatuses = [
        { id: "todo", label: "Todo", icon: Circle, color: "text-slate-400" },
        { id: "in-progress", label: "In Progress", icon: PlayCircle, color: "text-blue-500" },
        { id: "done", label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
    ];

    // Generate options from columns if available
    const options = columns && columns.length > 0
        ? columns.map(c => ({
            id: c.id,
            label: c.title || "Unknown",
            icon: (c.title || "").toLowerCase().includes("done") ? CheckCircle2 : (c.title || "").toLowerCase().includes("progress") ? PlayCircle : Circle,
            color: (c.title || "").toLowerCase().includes("done") ? "text-emerald-500" : (c.title || "").toLowerCase().includes("progress") ? "text-blue-500" : "text-slate-400"
        }))
        : defaultStatuses;

    useEffect(() => {
        setStatusId(columns ? task.column_id : task.status);
    }, [task.column_id, task.status, columns]);

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
        setStatusId(value);
        setIsOpen(false);

        if (columns) {
            await updateTaskColumn(task.id, value);
        } else {
            await updateTask(task.id, { status: value });
        }

        if (onUpdate) onUpdate();
    };

    const currentOption = options.find(s => s.id === statusId) || options[0];
    const Icon = currentOption.icon;

    return (
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title={`Status: ${currentOption.label}`}
            >
                <Icon size={16} className={currentOption.color} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-1 flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {options.map((s: any) => (
                        <button
                            key={s.id}
                            onClick={() => handleSelect(s.id)}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-left text-xs w-full"
                        >
                            <s.icon size={14} className={s.color} />
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{s.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
