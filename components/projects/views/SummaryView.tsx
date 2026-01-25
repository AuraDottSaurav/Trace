"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar, User } from "lucide-react";

interface SummaryViewProps {
    tasks: any[];
    columns: any[];
    members: any[];
}

export default function SummaryView({ tasks, columns, members }: SummaryViewProps) {
    // 1. Status Breakdown
    const statusData = useMemo(() => {
        return columns.map(col => ({
            name: col.name,
            value: tasks.filter(t => t.column_id === col.id).length,
            color: col.name === "Done" ? "#22c55e" : col.name === "In Progress" ? "#3b82f6" : "#64748b"
        })).filter(d => d.value > 0);
    }, [tasks, columns]);

    // 2. Priority Breakdown
    const priorityData = useMemo(() => {
        const priorities = ["High", "Medium", "Low"];
        return priorities.map(p => ({
            name: p,
            value: tasks.filter(t => t.priority === p).length,
            color: p === "High" ? "#ef4444" : p === "Medium" ? "#f59e0b" : "#10b981"
        }));
    }, [tasks]);

    // 3. Recent Activity (Mock logic using created_at if available or just top 5)
    const recentActivity = useMemo(() => {
        return [...tasks]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 5);
    }, [tasks]);

    // 4. Team Workload
    const workloadData = useMemo(() => {
        return members.map(m => ({
            name: m.name,
            value: tasks.filter(t => t.assignee_id === m.userId).length
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [tasks, members]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.name === "Done";
    }).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; // Indigo, Emerald, Amber, Red, Violet

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 text-white text-xs rounded-lg py-1 px-2 shadow-xl border border-slate-700">
                    <p className="font-medium">{`${label || payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    const CustomCursor = (props: any) => {
        const { x, y, width, height } = props;
        return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} className="fill-slate-100 dark:fill-slate-800/50" />;
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20 p-8">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Project Overview</h2>
                    <p className="text-slate-500 mt-1">Real-time insights and activity tracking.</p>
                </div>

                {/* Top Stats - Flat & Clean */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Issues</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{totalTasks}</h3>
                            </div>
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">All time</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{completionRate}%</h3>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Team Members</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{members.length}</h3>
                            </div>
                            <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                                <User size={24} />
                            </div>
                        </div>
                        <div className="flex -space-x-2 mt-auto">
                            {members.slice(0, 5).map(m => (
                                <div key={m.userId} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                                    {m.avatar && <img src={m.avatar} className="w-full h-full object-cover" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Charts Section */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Breakdown */}
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6">Status Breakdown</h3>
                            <div className="flex-1 min-h-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            iconSize={8}
                                            iconType="circle"
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTasks}</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tasks</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Breakdown */}
                        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6">Priority Distribution</h3>
                            <div className="flex-1 min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={priorityData} barSize={32}>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                        />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val: number) => `${val}`} />
                                        <Tooltip cursor={<CustomCursor />} content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                                            {priorityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity List - Feed Style */}
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
                        </div>

                        <div className="flex-1 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800" />

                            <div className="space-y-8">
                                {recentActivity.map((task, i) => {
                                    const assignee = members.find(m => m.userId === task.assignee_id);
                                    const col = columns.find(c => c.id === task.column_id);

                                    return (
                                        <div key={task.id} className="relative flex gap-4 group">
                                            {/* Icon Node */}
                                            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-colors">
                                                {task.priority === 'High' ? (
                                                    <AlertCircle size={16} className="text-red-500" />
                                                ) : (
                                                    <CheckCircle2 size={16} className="text-indigo-500" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pt-1.5 pb-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none mb-1.5 group-hover:text-indigo-600 transition-colors cursor-pointer">
                                                            {task.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Created in <span className="font-medium text-slate-700 dark:text-slate-300">{col?.name}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-400 font-medium px-2 py-1 rounded-full whitespace-nowrap">
                                                        {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>

                                                {/* Assignee chip */}
                                                {assignee && (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                                            {assignee.avatar ? (
                                                                <img src={assignee.avatar} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-700">{assignee.name[0]}</div>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-slate-400">Assigned to {assignee.name.split(' ')[0]}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
