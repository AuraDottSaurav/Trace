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
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
                    {columns.map((col) => (
                        <div key={col.id} className="flex flex-col bg-slate-50/50 dark:bg-slate-900/30 min-w-[300px] w-[320px] rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/50 h-full max-h-[calc(100vh-12rem)]">
                            {/* Inlining Column for click handler access if needed or just use KanbanColumn */}
                            <KanbanColumn
                                column={col}
                                tasks={tasks.filter((t: any) => t.column_id === col.id)}
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

            {/* Select Task for Editing (Overlay or just standard non-drag click) */}
            {/* Note: TaskCard needs to trigger setSelectedTask. 
                 But TaskCard is inside KanbanColumn.
                 We can't easily pass props through dnd-kit context without custom context.
                 Alternative: Use global event bus or just Click handler on the Board with delegation?
                 Or: Modifying KanbanColumn/TaskCard to accept onClick.
                 Let's assume we modify TaskCard to accept onClick in next step or use a context.
             */}
            <TaskDetailsModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                columns={columns}
                members={members}
            />

            {/* QUICK FIX: We need to pass click handler. 
                 Since I overwrote KanbanBoard, and I'm using KanbanColumn, I need to pass setSelectTask down.
                 I will update KanbanColumn and TaskCard to accept onTaskClick.
             */}
        </>
    );
}
