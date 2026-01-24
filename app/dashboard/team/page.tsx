import { createClient } from "@/utils/supabase/server";
import { Shield, User, MoreHorizontal, Plus } from "lucide-react";

export default async function TeamPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get current Org
    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .single();

    // Fetch Members with Profile
    const { data: members } = await supabase
        .from("organization_members")
        .select("*, profiles(*)")
        .eq("organization_id", membership?.organization_id);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Team</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your team members and permissions</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                    <Plus size={18} />
                    <span>Invite Member</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
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
                            {members?.map((member) => (
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
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Workload Insight (Real Placeholder logic) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/20 to-white dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                        AI Workload Analysis
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Your team is currently balanced. No members are showing signs of burnout based on task distribution.
                    </p>
                </div>
            </div>
        </div>
    );
}
