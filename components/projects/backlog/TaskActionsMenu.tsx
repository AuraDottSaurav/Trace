"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Pencil, ArrowRight } from "lucide-react";
import { deleteTask } from "@/actions/tasks";

interface TaskActionsMenuProps {
    task: any;
    onEdit: () => void;
}

export default function TaskActionsMenu({ task, onEdit }: TaskActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        setIsDeleting(true);
        await deleteTask(task.id);
        setIsDeleting(false);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors"
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 py-1">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onEdit();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-sm text-slate-700 dark:text-slate-300"
                    >
                        <Pencil size={14} />
                        <span>Edit issue</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-left text-sm text-red-600 dark:text-red-400"
                    >
                        <Trash2 size={14} />
                        <span>{isDeleting ? "Deleting..." : "Delete issue"}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
