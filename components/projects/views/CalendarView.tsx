"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import TaskDetailsModal from "../TaskDetailsModal";

interface CalendarViewProps {
    tasks: any[];
    columns: any[];
    members: any[];
    onAddTask: () => void;
}

export default function CalendarView({ tasks, columns, members, onAddTask }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getTasksForDate = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        return tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <>
            <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button onClick={prevMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><ChevronLeft size={16} /></button>
                            <button onClick={nextMonth} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <button onClick={onAddTask} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <Plus size={16} /> Add Task
                    </button>
                </div>

                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">{d}</div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden">
                    {blanks.map(i => <div key={`blank-${i}`} className="border-r border-b border-slate-100 dark:border-slate-800 bg-slate-50/20" />)}
                    {days.map(day => {
                        const dayTasks = getTasksForDate(day);
                        return (
                            <div key={day} className="border-r border-b border-slate-100 dark:border-slate-800 p-2 min-h-[100px] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors relative group">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{day}</span>
                                <div className="mt-2 space-y-1">
                                    {dayTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className="px-2 py-1 rounded-md text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 truncate cursor-pointer hover:bg-indigo-100 transition-colors"
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
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
