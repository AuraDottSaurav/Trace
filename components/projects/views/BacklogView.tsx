import { useState, useMemo } from "react";
import SprintSection from "../backlog/SprintSection";
import MemberFilter from "../MemberFilter";
import { Plus, Search, Filter, SlidersHorizontal, ChevronDown, User } from "lucide-react";
import { createSprint, updateSprintStatus, updateSprint } from "@/actions/sprints";
import { updateTaskSprint } from "@/actions/tasks";
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

interface BacklogViewProps {
    tasks: any[];
    sprints: any[];
    projectId: string;
    onCreateTask: (sprintId?: string) => void;
    onTaskClick: (task: any) => void;
    members: any[];
    columns: any[];
}

export default function BacklogView({ tasks, sprints, projectId, onCreateTask, onTaskClick, members, columns }: BacklogViewProps) {
    const [isCreatingSprint, setIsCreatingSprint] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [localTasks, setLocalTasks] = useState(tasks);
    const [activeTask, setActiveTask] = useState<any | null>(null);

    const [activeMemberFilter, setActiveMemberFilter] = useState<string | null>(null);

    // Sync local tasks when props change
    useMemo(() => {
        setLocalTasks(tasks);
    }, [tasks]);

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

    // Filter tasks based on search AND member filter
    const filteredTasks = localTasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.task_type && t.task_type.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesMember = activeMemberFilter === null
            ? true
            : activeMemberFilter === "unassigned"
                ? !t.assignee_id
                : t.assignee_id === activeMemberFilter;

        return matchesSearch && matchesMember;
    });

    // Group tasks by sprint
    const tasksBySprint = filteredTasks.reduce((acc, task) => {
        const key = task.sprint_id || "backlog";
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {} as Record<string, typeof filteredTasks>);

    // Sort sprints: Active first, then Future by date
    const sortedSprints = [...sprints].sort((a, b) => {
        if (a.status === 'active') return -1;
        if (b.status === 'active') return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const backlogTasks = tasksBySprint["backlog"] || [];

    const handleCreateSprint = async () => {
        setIsCreatingSprint(true);
        const name = `Sprint ${sprints.length + 1}`;
        await createSprint(projectId, name);
        setIsCreatingSprint(false);
    };

    const handleStartSprint = async (sprintId: string, data?: { startDate: string; endDate: string; goal: string }) => {
        if (data) {
            const result = await updateSprint(sprintId, {
                start_date: data.startDate,
                end_date: data.endDate,
                goal: data.goal
            });
            if (!result) throw new Error("Failed to update sprint details. Please check logs.");
        }

        const statusResult = await updateSprintStatus(sprintId, "active");
        if (!statusResult) throw new Error("Failed to activate sprint. Please try again.");
    };

    const handleCompleteSprint = async (sprintId: string) => {
        await updateSprintStatus(sprintId, "closed");
    }

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = localTasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the containers
        const activeTask = localTasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Verify if dropping over a container (Sprint) or another Task
        // We will treat overId as either a task ID or a sprint ID
        // If overId is a sprint ID (or "backlog"), we just update the sprint_id
        // If overId is a task ID, we find that task's sprint_id and update matches

        // This logic is complex for sorting. For now, let's just handle moving between sprints effectively in DragEnd using simple container detection if possible
        // But SortableContext needs items.
        // Let's implement full DragOver for sorting visual feedback
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = localTasks.find(t => t.id === activeId);
        if (!activeTask) return;

        let newSprintId: string | null = null;

        // Check if over is a sprint container
        if (overId === "backlog" || sprints.some(s => s.id === overId)) {
            newSprintId = overId === "backlog" ? null : (overId as string);
        } else {
            // Over another task
            const overTask = localTasks.find(t => t.id === overId);
            if (overTask) {
                newSprintId = overTask.sprint_id || null;
            }
        }

        // Update if changed
        if (newSprintId !== undefined && activeTask.sprint_id !== (newSprintId || null)) {
            // Optimistic update
            setLocalTasks(prev => prev.map(t =>
                t.id === activeId ? { ...t, sprint_id: newSprintId } : t
            ));

            // Server action
            await updateTaskSprint(activeId as string, newSprintId);
        }
    };

    const toggleMemberFilter = (memberId: string) => {
        setActiveMemberFilter(current => current === memberId ? null : memberId);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="h-full flex flex-col bg-white dark:bg-slate-950">
                {/* Toolbar / Filters */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
                    <div className="flex items-center gap-4 w-full flex-1">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search backlog"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 transition-shadow"
                            />
                        </div>

                        <MemberFilter members={members} activeFilter={activeMemberFilter} onToggle={toggleMemberFilter} />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateSprint}
                            disabled={isCreatingSprint}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isCreatingSprint ? "Creating..." : "Create sprint"}
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-slate-500 font-medium">
                                {filteredTasks.length} issues
                            </div>
                        </div>

                        {/* Sprints Sections */}
                        {sortedSprints.map(sprint => (
                            <SprintSection
                                key={sprint.id}
                                sprint={sprint}
                                tasks={tasksBySprint[sprint.id] || []}
                                onCreateTask={() => onCreateTask(sprint.id)}
                                onTaskClick={onTaskClick}
                                onStartSprint={handleStartSprint}
                                onCompleteSprint={handleCompleteSprint}
                                members={members}
                                columns={columns}
                            />
                        ))}

                        {/* Backlog Section */}
                        <SprintSection
                            sprint={{ id: "backlog", name: "Backlog", status: "future" } as any}
                            tasks={backlogTasks}
                            onCreateTask={() => onCreateTask(undefined)}
                            onTaskClick={onTaskClick}
                            members={members}
                            columns={columns}
                        />
                    </div>
                </div>
            </div>
            {/* Drag Overlay */}
            {typeof document !== "undefined" && createPortal(
                <DragOverlay>
                    {activeTask && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-indigo-500/50 flex items-center gap-3">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{activeTask.title}</span>
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
