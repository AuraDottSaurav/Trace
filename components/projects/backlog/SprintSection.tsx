import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Calendar, Plus, User } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskAssigneeSelect from "./TaskAssigneeSelect";
import TaskActionsMenu from "./TaskActionsMenu";
import StoryPointsSelect from "./StoryPointsSelect";
import TaskPrioritySelect from "./TaskPrioritySelect";
import TaskStatusSelect from "./TaskStatusSelect";
import StartSprintModal from "./StartSprintModal";

interface Task {
    id: string;
    title: string;
    priority: string;
    status: string;
    story_points?: number;
    assignee?: any;
    task_type?: "story" | "bug" | "task" | "epic";
    sprint_id?: string;
    column_id?: string;
}

interface Sprint {
    id: string;
    name: string;
    status: "active" | "future" | "closed";
    start_date?: string;
    end_date?: string;
    project_id?: string;
}

interface SprintSectionProps {
    sprint: Sprint;
    tasks: Task[];
    onStartSprint?: (id: string, data: { startDate: string; endDate: string; goal: string }) => Promise<void>;
    onCompleteSprint?: (id: string) => void;
    onEditSprint?: (id: string) => void;
    onMoveTask?: (taskId: string, sprintId: string) => void;
    onCreateTask?: () => void;
    onTaskClick?: (task: Task) => void;
    members: any[];
    columns: any[];
}

function SortableTaskRow({ task, onClick, members, columns }: { task: Task; onClick?: (task: Task) => void; members: any[]; columns: any[] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { type: "Task", task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : "auto",
        position: 'relative' as 'relative', // Ensure dropdowns position effectively
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            className="flex items-center justify-between py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 last:border-0"
        >
            <div className="flex items-center gap-4 min-w-0">
                {/* Task Type Icon + Status Selection */}
                <div className="flex items-center gap-2">
                    <TaskStatusSelect task={task} columns={columns} />

                    <div className="flex-shrink-0" title={task.task_type || "story"}>
                        {task.task_type === 'bug' ? (
                            <div className="w-4 h-4 rounded-sm bg-red-500 flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                        ) : task.task_type === 'epic' ? (
                            <div className="w-4 h-4 rounded-sm bg-purple-500 flex items-center justify-center shadow-sm"><div className="w-1.5 h-2.5 bg-white rounded-[1px]"></div></div>
                        ) : task.task_type === 'task' ? (
                            <div className="w-4 h-4 rounded-sm bg-blue-500 flex items-center justify-center shadow-sm"><div className="w-2.5 h-2.5 bg-white rounded-[1px]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div></div>
                        ) : (
                            <div className="w-4 h-4 rounded-sm bg-emerald-500 flex items-center justify-center shadow-sm"><div className="w-1.5 h-2 bg-white rounded-[1px]"></div></div> // Story
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</span>
                </div>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
                <TaskPrioritySelect task={task} />
                <TaskAssigneeSelect task={task} members={members} />
                <StoryPointsSelect task={task} />
                <TaskActionsMenu task={task} onEdit={() => onClick?.(task)} />
            </div>
        </div>
    );
}

export default function SprintSection({ sprint, tasks, onStartSprint, onCompleteSprint, onEditSprint, onCreateTask, onTaskClick, members, columns }: SprintSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);

    const { setNodeRef } = useDroppable({
        id: sprint.id,
        data: { type: "Sprint", sprint }
    });

    const handleStartSprint = async (data: { startDate: string; endDate: string; goal: string }) => {
        if (onStartSprint) {
            await onStartSprint(sprint.id, data);
        }
    };

    const totalPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const taskCount = tasks.length;

    const formatDateRange = (start?: string, end?: string) => {
        if (!start || !end) return "";
        const s = new Date(start);
        const e = new Date(end);
        return `${s.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
    };

    return (
        <div ref={setNodeRef} className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
            {/* Header */}
            <div className={`flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 cursor-pointer ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{sprint.name}</h3>
                        <span className="text-xs text-slate-500 hidden sm:inline-block">
                            {formatDateRange(sprint.start_date, sprint.end_date)} {sprint.status === 'active' && <span className="text-emerald-600 font-medium ml-2">(Active)</span>}
                        </span>
                        <span className="text-xs text-slate-400">({taskCount} issues)</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-300 dark:bg-slate-600 rounded-full text-[10px]">{totalPoints}</span>
                        <span>Estimate</span>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {sprint.status === 'future' && (
                            <button
                                onClick={() => setIsStartModalOpen(true)}
                                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-semibold rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                                Start sprint
                            </button>
                        )}
                        {sprint.status === 'active' && (
                            <button
                                onClick={() => onCompleteSprint?.(sprint.id)}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-medium rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                Complete sprint
                            </button>
                        )}
                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Task List */}
            {isExpanded && (
                <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 min-h-[50px] rounded-b-lg">
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.length === 0 ? (
                            <div className="text-center py-8 border-b border-t border-dashed border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 text-xs text-dashed">
                                Plan a sprint by dragging work items here
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {tasks.map(task => (
                                    <SortableTaskRow key={task.id} task={task} onClick={onTaskClick} members={members} columns={columns} />
                                ))}
                            </div>
                        )}
                    </SortableContext>

                    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-lg">
                        <button
                            onClick={onCreateTask}
                            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 pl-4 w-full text-left transition-colors rounded-b-lg"
                        >
                            <Plus size={14} />
                            <span className="font-semibold">Create issue</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Start Sprint Modal */}
            <StartSprintModal
                isOpen={isStartModalOpen}
                onClose={() => setIsStartModalOpen(false)}
                onStart={handleStartSprint}
                sprintName={sprint.name}
            />
        </div>
    );
}
