import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import { currentUser } from "@clerk/nextjs/server";
import { User, Building, Monitor } from "lucide-react";

export default async function SettingsPage() {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

    // Fetch Organization
    const { data: membership } = await supabase
        .from("organization_members")
        .select("*, organizations(*)")
        .eq("user_id", user?.id)
        .limit(1)
        .single();

    const org = membership?.organizations;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage your account and workspace preferences</p>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Profile</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                            <input
                                disabled
                                value={profile?.full_name || "Not set"}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-300 outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                            <input
                                disabled
                                value={user?.emailAddresses[0]?.emailAddress || ""}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-300 outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">User ID</label>
                            <div className="font-mono text-xs bg-slate-100 dark:bg-slate-950 p-3 rounded-xl text-slate-500 break-all">
                                {user?.id}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Organization Section */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Building size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Organization / Workspace</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Workspace Name</label>
                            <input
                                disabled
                                value={org?.name || ""}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-300 outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Slug (URL)</label>
                            <input
                                disabled
                                value={org?.slug || ""}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-600 dark:text-slate-300 outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Your Role</label>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                                {membership?.role}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Theme Section (Visual Only for now as toggle is in sidebar) */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-violet-100 dark:bg-violet-900/40 p-2 rounded-lg text-violet-600 dark:text-violet-400">
                            <Monitor size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Appearance</h2>
                    </div>
                    <p className="text-sm text-slate-500">Theme preferences are managed in the sidebar for quick access.</p>
                </section>
            </div>
        </div>
    );
}
