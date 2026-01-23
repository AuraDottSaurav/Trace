"use client";

import { inviteMember } from "@/actions/invite";
import { Users, Mail, Plus } from "lucide-react";
import { useState } from "react";

export default function TeamPage() {
    const [isInviting, setIsInviting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Team Members</h1>
                    <p className="text-slate-500 mt-1">Manage who has access to this workspace.</p>
                </div>
                <button
                    onClick={() => setIsInviting(!isInviting)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} />
                    <span>Invite Member</span>
                </button>
            </div>

            {isInviting && (
                <div className="mb-8 glass p-6 rounded-xl border border-white/50 dark:border-slate-800 animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Mail size={20} className="text-indigo-600" />
                        Invite via Email
                    </h3>
                    <form
                        action={async (formData) => {
                            const res = await inviteMember(formData);
                            if (res?.error) setFeedback(res.error);
                            if (res?.success) {
                                setFeedback(res.success);
                                setTimeout(() => setIsInviting(false), 2000);
                            }
                        }}
                        className="flex gap-4"
                    >
                        <input
                            name="email"
                            type="email"
                            placeholder="colleague@company.com"
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            required
                        />
                        <select
                            name="role"
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90">
                            Send Invite
                        </button>
                    </form>
                    {feedback && (
                        <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                            {feedback}
                        </p>
                    )}
                </div>
            )}

            {/* Mock List for Demo */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-medium text-slate-500 text-sm">User</th>
                            <th className="px-6 py-4 font-medium text-slate-500 text-sm">Role</th>
                            <th className="px-6 py-4 font-medium text-slate-500 text-sm">Status</th>
                            <th className="px-6 py-4 font-medium text-slate-500 text-sm">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">U</div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">You</p>
                                        <p className="text-xs text-slate-500">user@example.com</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Admin</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    Active
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">Just now</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
