"use client";

import { useMemo, useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import { updateTaskColumn } from "@/actions/tasks";
import { createPortal } from "react-dom";
import TaskDetailsModal from "../TaskDetailsModal";
import { Search } from "lucide-react";
import MemberFilter from "../MemberFilter";

interface KanbanBoardProps {
    projectId: string;
    initialColumns: any[];
    initialTasks: any[];
    members?: any[];
    onAddColumnTask?: (columnId: string) => void;
}

export default function KanbanBoard({ projectId, initialColumns, initialTasks, members = [], onAddColumnTask }: KanbanBoardProps) {
    const [columns, setColumns] = useState(initialColumns);
    const [tasks, setTasks] = useState(initialTasks);
    const [activeTask, setActiveTask] = useState<any | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Sync state with props when server revalidates
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    useEffect(() => {
        setColumns(initialColumns);
    }, [initialColumns]);

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t: any) => t.id === activeId);
                const overIndex = tasks.findIndex((t: any) => t.id === overId);
                const activeTask = tasks[activeIndex];
                const overTask = tasks[overIndex];

                // If moving to a different column visually
                if (activeTask.column_id !== overTask.column_id) {
                    activeTask.column_id = overTask.column_id;
                    return arrayMove(tasks, activeIndex, overIndex - 1); // rough approximation for now
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t: any) => t.id === activeId);
                const activeTask = tasks[activeIndex];
                if (activeTask.column_id !== overId) {
                    activeTask.column_id = overId;
                    return [...tasks]; // Trigger re-render
                }
                return tasks;
            });
        }
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [activeMemberFilter, setActiveMemberFilter] = useState<string | null>(null);

    // Filter tasks for display
    const filteredTasks = tasks.filter((t: any) => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMember = activeMemberFilter === null
            ? true
            : activeMemberFilter === "unassigned"
                ? !t.assignee_id
                : t.assignee_id === activeMemberFilter;
        return matchesSearch && matchesMember;
    });

    const toggleMemberFilter = (memberId: string) => {
        setActiveMemberFilter(current => current === memberId ? null : memberId);
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";
        const isOverTask = over.data.current?.type === "Task";

        let newColumnId: string | null = null;

        if (isActiveTask) {
            const activeTask = tasks.find((t: any) => t.id === activeId);

            if (isOverColumn) {
                newColumnId = overId as string;
            } else if (isOverTask) {
                const overTask = tasks.find((t: any) => t.id === overId);
                newColumnId = overTask?.column_id;
            }

            if (newColumnId && activeTask && activeTask.column_id !== newColumnId) {
                // Update Local State finalized
                setTasks((prev: any[]) => {
                    return prev.map((t) =>
                        t.id === activeId ? { ...t, column_id: newColumnId } : t
                    );
                });

                // Server Action
                await updateTaskColumn(activeId as string, newColumnId as string);
            }
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search board"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 transition-shadow"
                        />
                    </div>
                    <MemberFilter members={members} activeFilter={activeMemberFilter} onToggle={toggleMemberFilter} />
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
                    {columns.map((col) => (
                        <div key={col.id} className="flex flex-col bg-slate-50/50 dark:bg-slate-900/30 min-w-[300px] w-[320px] rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 h-full max-h-[calc(100vh-16rem)]">
                            {/* Inlining Column for click handler access if needed or just use KanbanColumn */}
                            <KanbanColumn
                                column={col}
                                tasks={filteredTasks.filter((t: any) => t.column_id === col.id)}
                                onTaskClick={setSelectedTask}
                                onAddClick={() => onAddColumnTask?.(col.id)}
                            />
                        </div>
                    ))}
                </div>

                {/* Drag Overlay */}
                {typeof document !== "undefined" && createPortal(
                    <DragOverlay>
                        {activeTask && (
                            <TaskCard task={activeTask} />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            <TaskDetailsModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                columns={columns}
                members={members}
            />
        </div>
    );
}
