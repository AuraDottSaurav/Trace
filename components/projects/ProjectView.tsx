"use client";

import { useState } from "react";
import Link from "next/link";
import ProjectHeader from "./ProjectHeader";
import KanbanBoard from "./kanban/KanbanBoard";
import InviteMemberModal from "../InviteMemberModal";
import CreateTaskModal from "./CreateTaskModal";
// New Imports
// New Imports
import ListView from "./views/ListView";
import TimelineView from "./views/TimelineView";
import CalendarView from "./views/CalendarView";
import BacklogView from "./views/BacklogView";
import SummaryView from "./views/SummaryView";
import ProjectSettingsModal from "./ProjectSettingsModal";
import TaskDetailsModal from "./TaskDetailsModal";

interface ProjectViewProps {
    project: any;
    tasks: any[];
    columns: any[];
    sprints: any[];
    members: any[];
    projectId: string;
}

export default function ProjectView({ project, tasks, columns, sprints, members, projectId }: ProjectViewProps) {
    const [currentView, setCurrentView] = useState<"summary" | "board" | "list" | "timeline" | "calendar" | "backlog">("board");
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>(undefined);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const handleCreateTask = (columnId?: string) => {
        setDefaultColumnId(columnId || columns[0]?.id);
        setIsCreateTaskOpen(true);
    };

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* ... (Header Area skipped for brevity, keeping same) */}
            <div className="flex flex-col gap-6 mb-8 flex-shrink-0">
                {/* Top Nav Row */}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-[-12px]">
                    <Link href="/dashboard/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
                    <span>/</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{project.name}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/20">
                            {project.key || project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">{project.name}</h1>
                            <p className="text-slate-500 text-sm mt-1 leading-none">{project.description}</p>
                        </div>
                    </div>

                    <ProjectHeader
                        projectId={projectId}
                        onCreateTask={() => handleCreateTask()}
                        onInvite={() => setIsInviteOpen(true)}
                        onSettings={() => setIsSettingsOpen(true)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setCurrentView("summary")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentView === "summary" ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-t-lg"}`}
                    >
                        Summary
                    </button>
                    <button
                        onClick={() => setCurrentView("backlog")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentView === "backlog" ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-t-lg"}`}
                    >
                        Backlog
                    </button>
                    <button
                        onClick={() => setCurrentView("board")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentView === "board" ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-t-lg"}`}
                    >
                        Board
                    </button>
                    <button
                        onClick={() => setCurrentView("list")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentView === "list" ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-t-lg"}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setCurrentView("timeline")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentView === "timeline" ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-t-lg"}`}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setCurrentView("calendar")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${currentView === "calendar" ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-t-lg"}`}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden">
                {currentView === "summary" && (
                    <SummaryView tasks={tasks} columns={columns} members={members} />
                )}
                {currentView === "backlog" && (
                    <BacklogView
                        tasks={tasks}
                        sprints={sprints}
                        projectId={projectId}
                        onCreateTask={() => handleCreateTask()}
                        onTaskClick={handleTaskClick}
                        members={members}
                        columns={columns}
                    />
                )}
                {currentView === "board" && (
                    <KanbanBoard
                        projectId={projectId}
                        initialColumns={columns}
                        initialTasks={tasks}
                        members={members}
                        onAddColumnTask={(colId) => handleCreateTask(colId)}
                    />
                )}
                {currentView === "list" && (
                    <ListView tasks={tasks} columns={columns} members={members} />
                )}
                {currentView === "timeline" && (
                    <TimelineView tasks={tasks} columns={columns} members={members} />
                )}
                {currentView === "calendar" && (
                    <CalendarView
                        tasks={tasks}
                        columns={columns}
                        members={members}
                        onAddTask={() => handleCreateTask()}
                    />
                )}
            </div>

            {/* Modals */}
            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                projectId={projectId}
                columns={columns}
                members={members}
                sprints={sprints}
                defaultColumnId={defaultColumnId}
            />

            <TaskDetailsModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                columns={columns}
                members={members}
            />

            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />

            <ProjectSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                project={project}
            />
        </div>
    );
}
