"use client";

import { useState, useRef, useEffect } from "react";
import { updateTask } from "@/actions/tasks";

interface StoryPointsSelectProps {
    task: any;
    onUpdate?: () => void;
}

export default function StoryPointsSelect({ task, onUpdate }: StoryPointsSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [points, setPoints] = useState<number | null>(task.story_points || null);
    const [manualValue, setManualValue] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    const pointOptions = [1, 2, 3, 5, 8, 13, 21];

    useEffect(() => {
        setPoints(task.story_points);
        if (task.story_points && !pointOptions.includes(task.story_points)) {
            setManualValue(task.story_points.toString());
        }
    }, [task.story_points]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (value: number | null) => {
        setPoints(value);
        setIsOpen(false);
        await updateTask(task.id, { story_points: value });
        if (onUpdate) onUpdate();
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = manualValue === "" ? null : parseFloat(manualValue);
        if (val !== null && isNaN(val)) return; // Simple validation

        await handleSelect(val);
    };

    return (
        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-6 h-5 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${points ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
            >
                {points || "-"}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 p-2">
                    <div className="grid grid-cols-4 gap-1 mb-2">
                        <button
                            onClick={() => handleSelect(null)}
                            className="flex items-center justify-center p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs text-slate-500 col-span-4"
                        >
                            Clear
                        </button>
                        {pointOptions.map(p => (
                            <button
                                key={p}
                                onClick={() => handleSelect(p)}
                                className={`flex items-center justify-center w-full aspect-square rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs font-medium ${points === p ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" : "text-slate-600 dark:text-slate-300"}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Custom"
                                value={manualValue}
                                onChange={(e) => setManualValue(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button type="submit" className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium rounded hover:bg-indigo-500 hover:text-white transition-colors">
                                Set
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
