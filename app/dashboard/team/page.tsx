import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Shield, User, Zap, Activity, TrendingUp } from "lucide-react";
import MemberActionsMenu from "@/components/MemberActionsMenu";
import TeamPageHeader from "@/components/TeamPageHeader";

export default async function TeamPage() {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
        redirect("/login");
    }

    // Get current Org
    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-500">No organization found.</p>
            </div>
        );
    }

    // 1. Fetch Members
    const { data: membersData } = await supabase
        .from("organization_members")
        .select("*, profiles(*)")
        .eq("organization_id", membership.organization_id);

    const members = membersData || [];

    // 2. Fetch Tasks for Insights
    const { data: tasks } = await supabase
        .from("tasks")
        .select("id, status, assignee_id, created_at, project:projects!inner(organization_id)")
        .eq("project.organization_id", membership.organization_id);

    // Calculations
    let velocity = 0;
    const activeTasksMap: Record<string, number> = {};

    if (tasks) {
        // Velocity
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const completedRecent = tasks.filter((t: any) =>
            t.status === 'Done' && new Date(t.created_at) > oneWeekAgo
        ).length;

        velocity = Number((completedRecent / 7).toFixed(1));

        // Workload
        tasks.forEach((t: any) => {
            if (t.status !== 'Done' && t.assignee_id) {
                activeTasksMap[t.assignee_id] = (activeTasksMap[t.assignee_id] || 0) + 1;
            }
        });
    }

    return (
        <div className="max-w-5xl mx-auto">
            <TeamPageHeader />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Insights Card 1: Team Velocity */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Team Velocity</h3>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{velocity}</span>
                        <span className="text-sm text-slate-500 mb-1.5">tasks / day</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((velocity / 10) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">
                        <TrendingUp size={12} className="inline mr-1 text-green-500" />
                        Based on last 7 days activity
                    </p>
                </div>

                {/* Insights Card 2: Workload Distribution */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Activity size={20} />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Workload & Burnout Risk</h3>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                            Real-time
                        </span>
                    </div>

                    <div className="space-y-4">
                        {members.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No team members yet.</p>
                        ) : members.slice(0, 3).map((member: any) => {
                            const taskCount = activeTasksMap[member.user_id] || 0;
                            const maxTasks = 10;
                            const percentage = Math.min((taskCount / maxTasks) * 100, 100);
                            const colorClass = taskCount > 8 ? "bg-orange-500" : "bg-indigo-500";

                            return (
                                <div key={member.id} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {member.profiles?.full_name?.[0] || "U"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{member.profiles?.full_name || "Unknown"}</span>
                                            <span className="text-slate-500">{taskCount} active tasks</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${colorClass}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Joined</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {members.map((member: any) => (
                                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-medium">
                                                {member.profiles?.full_name?.[0] || member.profiles?.email?.[0] || <User size={16} />}
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-slate-200">
                                                {member.profiles?.full_name || "Unknown User"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {member.profiles?.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                            }`}>
                                            {member.role === 'admin' ? <Shield size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(member.joined_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <MemberActionsMenu
                                            memberId={member.id}
                                            currentRole={member.role}
                                            isCurrentUser={member.user_id === user.id}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
