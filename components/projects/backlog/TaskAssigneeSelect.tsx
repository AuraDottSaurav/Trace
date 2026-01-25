"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Check } from "lucide-react";
import { updateTask } from "@/actions/tasks";

interface TaskAssigneeSelectProps {
    task: any;
    members: any[];
    onUpdate?: () => void;
}

export default function TaskAssigneeSelect({ task, members, onUpdate }: TaskAssigneeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [assigneeId, setAssigneeId] = useState<string | null>(task.assignee_id || null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setAssigneeId(task.assignee_id);
    }, [task.assignee_id]);

    useEffect(() => {
        const handleResize = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener("scroll", handleResize, true);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleResize, true);
            window.removeEventListener("resize", handleResize);
        }
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                return;
            }

            // Check if clicked inside dropdown
            const dropdown = document.getElementById(`assignee-dropdown-${task.id}`);
            if (dropdown && dropdown.contains(event.target as Node)) {
                return;
            }

            setIsOpen(false);
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, task.id]);

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const DROPDOWN_WIDTH = 224; // w-56
            const DROPDOWN_MAX_HEIGHT = 300; // rough max height

            const viewportWidth = window.document.documentElement.clientWidth;
            const viewportHeight = window.document.documentElement.clientHeight;

            let top = rect.bottom + 4;
            let left = rect.left;

            // Horizontal Check
            // If the default left-aligned position would overflow (or be very close to edge)
            if (left + DROPDOWN_WIDTH + 20 > viewportWidth) {
                // Align the RIGHT edge of the dropdown with the RIGHT edge of the button
                // This makes it expand to the left
                left = rect.right - DROPDOWN_WIDTH;
            }

            // Final safety check to ensures it doesn't overflow left edge either
            if (left < 10) left = 10;

            // Vertical Check
            const spaceBelow = viewportHeight - rect.bottom;
            // If less than ~260px space below, and we have more space above, flip up
            if (spaceBelow < 260 && rect.top > 260) {
                top = rect.top - 260; // Approximate height position above
            }

            setStyle({ top, left });
        }
        setIsOpen(!isOpen);
    };

    // Better Vertical Positioning: Measure after render?
    // Since we are using Portal, we can use useLayoutEffect if needed.
    // For now, let's stick to the simpler pre-calc which covers 90% of cases.

    const handleAssign = async (memberId: string | null) => {
        setAssigneeId(memberId);
        setIsOpen(false);
        await updateTask(task.id, { assignee_id: memberId });
        if (onUpdate) onUpdate();
    };

    const currentAssignee = members.find(m => m.userId === assigneeId);

    const dropdownContent = (
        <div
            id={`assignee-dropdown-${task.id}`}
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[9999] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-1 w-56 animate-in fade-in zoom-in-95 duration-100"
            style={style}
        >
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
                Assign to...
            </div>
            <div className="max-h-60 overflow-y-auto">
                <button
                    onClick={() => handleAssign(null)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-left text-sm"
                >
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User size={12} className="text-slate-400" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 flex-1">Unassigned</span>
                    {!assigneeId && <Check size={14} className="text-indigo-600" />}
                </button>

                {members.map(member => (
                    <button
                        key={member.id}
                        onClick={() => handleAssign(member.userId)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-left text-sm"
                    >
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden">
                            {member.avatar ? (
                                <img src={member.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{member.name?.[0]}</span>
                            )}
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 flex-1 truncate">{member.name}</span>
                        {assigneeId === member.userId && <Check size={14} className="text-indigo-600" />}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-white dark:border-slate-600 ring-1 ring-slate-100 dark:ring-slate-800 flex items-center justify-center hover:ring-indigo-500 transition-all"
            >
                {currentAssignee ? (
                    currentAssignee.avatar ? (
                        <img src={currentAssignee.avatar} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-xs font-bold">
                            {(currentAssignee.name?.[0] || "U")}
                        </div>
                    )
                ) : (
                    <User className="text-slate-300 dark:text-slate-600" size={12} />
                )}
            </button>
            {isOpen && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
        </>
    );
}
