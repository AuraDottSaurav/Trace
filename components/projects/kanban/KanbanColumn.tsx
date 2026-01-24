"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

interface Column {
    id: string;
    name: string;
}

interface Task {
    id: string;
    title: string;
    priority: "Low" | "Medium" | "High";
    column_id: string;
}

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onAddClick?: () => void;
}

export default function KanbanColumn({ column, tasks, onTaskClick, onAddClick }: KanbanColumnProps) {
    const {
        setNodeRef,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{column.name}</h3>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <button onClick={onAddClick} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Plus size={18} />
                </button>
            </div>

            {/* Task Area */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[100px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <div key={task.id} onClick={() => onTaskClick?.(task)}>
                            <TaskCard task={task} />
                        </div>
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
