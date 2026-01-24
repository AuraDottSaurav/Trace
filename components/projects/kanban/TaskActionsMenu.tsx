"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { deleteTask } from "@/actions/tasks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TaskActionsMenuProps {
    taskId: string;
}

export default function TaskActionsMenu({ taskId }: TaskActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent drag start or other parent clicks
        e.stopPropagation();

        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 160, // 160px width
            });
        }
        setIsOpen(!isOpen);
    };

    // Close listeners
    useEffect(() => {
        if (!isOpen) return;
        const close = () => setIsOpen(false);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        document.addEventListener("mousedown", (e) => {
            if (buttonRef.current && buttonRef.current.contains(e.target as Node)) return;
            close();
        });
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [isOpen]);

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this task?")) return;

        setIsLoading(true);
        const result = await deleteTask(taskId);
        setIsLoading(false);
        setIsOpen(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Task deleted");
            // Optimistic update should be handled by parent if possible, or router refresh
            // But since board state is local in dnd-kit, router.refresh might not be enough if state is diverged.
            // Ideally we pass a callback. For now let's try router refresh.
            // Actually, page.tsx keys board specific to data state so refresh should work if implemented cleanly.
            // But dnd-kit holds state.
            // We'll rely on server revalidation.

            // Reload page to ensure sync
            router.refresh();
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                disabled={isLoading}
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[9999] w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
                    style={{
                        top: coords.top - window.scrollY,
                        left: coords.left - window.scrollX
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); toast.info("Editing coming soon"); setIsOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded flex items-center gap-2"
                        >
                            <Edit size={14} />
                            Edit
                        </button>
                        <button
                            onClick={handleRemove}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-2 mt-1"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
