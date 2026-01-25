import { useState, useRef } from "react";
import TaskDetailsModal from "../TaskDetailsModal";

interface TimelineViewProps {
    tasks: any[];
    columns: any[];
    members: any[];
}

export default function TimelineView({ tasks, columns, members }: TimelineViewProps) {
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    // Mock timeline range (current month)
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    const COLUMN_WIDTH = 48;
    const ROW_HEIGHT = 48; // h-12

    const headerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollLeft } = e.currentTarget;
        if (headerRef.current) headerRef.current.scrollLeft = scrollLeft;
        if (sidebarRef.current) sidebarRef.current.scrollTop = scrollTop;
    };

    return (
        <>
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-[250px_1fr] grid-rows-[auto_1fr]">

                {/* 1. Top Left Corner (Fixed) */}
                <div className="z-20 bg-slate-50 dark:bg-slate-950 border-r border-b border-slate-200 dark:border-slate-800 p-3 font-semibold text-sm text-slate-500 flex items-center h-10">
                    Task Name
                </div>

                {/* 2. Top Header (Scrolls X, Fixed Y) */}
                <div
                    ref={headerRef}
                    className="overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex h-10"
                >
                    <div className="flex" style={{ width: days.length * COLUMN_WIDTH }}>
                        {days.map(d => (
                            <div
                                key={d}
                                className="border-r border-slate-200/50 dark:border-slate-800/50 text-center py-2.5 text-xs text-slate-400 flex-shrink-0"
                                style={{ width: COLUMN_WIDTH }}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Left Sidebar (Scrolls Y, Fixed X) */}
                <div
                    ref={sidebarRef}
                    className="overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
                >
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className="h-12 border-b border-slate-100 dark:border-slate-800 px-4 flex items-center text-sm font-medium text-slate-700 dark:text-slate-200 truncate hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedTask(task)}
                        >
                            {task.title}
                        </div>
                    ))}
                    {/* Spacer for scrollbar alignment if needed usually not needed with flex-1 */}
                    <div className="h-4"></div>
                </div>

                {/* 4. Main Content (Scrolls XY) */}
                <div
                    ref={bodyRef}
                    className="overflow-auto bg-white dark:bg-slate-900 custom-scrollbar"
                    onScroll={handleScroll}
                >
                    <div className="relative" style={{ width: days.length * COLUMN_WIDTH, height: tasks.length * ROW_HEIGHT }}>

                        {/* Grid Lines Background */}
                        <div className="absolute inset-0 flex pointer-events-none">
                            {days.map(d => (
                                <div key={d} className="border-r border-slate-100/50 dark:border-slate-800/30 h-full flex-shrink-0" style={{ width: COLUMN_WIDTH }} />
                            ))}
                        </div>

                        {/* Task Rows (For hover effect alignment, we render explicit rows) */}
                        {tasks.map((task, index) => {
                            const randomStart = Math.floor(Math.random() * 20);
                            const duration = Math.max(2, Math.floor(Math.random() * 8));
                            const leftPos = randomStart * COLUMN_WIDTH;
                            const width = duration * COLUMN_WIDTH;

                            return (
                                <div
                                    key={task.id}
                                    className="absolute w-full border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                                    style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT }}
                                >
                                    <div
                                        onClick={() => setSelectedTask(task)}
                                        className="absolute top-3 h-6 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-colors border border-indigo-400 cursor-pointer shadow-sm opacity-90 z-10"
                                        style={{
                                            left: `${leftPos}px`,
                                            width: `${width}px`
                                        }}
                                        title={`Due: ${task.due_date || 'No date'}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <TaskDetailsModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                columns={columns}
                members={members}
            />
        </>
    );
}
