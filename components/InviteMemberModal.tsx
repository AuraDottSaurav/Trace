"use client";

import { useState } from "react";
import { inviteMember } from "@/actions/invite";
import { X, Mail, Loader2, Send } from "lucide-react";

// import { toast } from "sonner"; // Assuming sonner is used, or basic alert if not


export default function InviteMemberModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [successEmail, setSuccessEmail] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setSuccessEmail(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {successEmail ? "Invitation Sent" : "Invite Team Member"}
                    </h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {successEmail ? (
                    <div className="p-8 flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-300">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 shadow-sm">
                            <Send size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Invitation sent!
                        </h3>
                        <p className="text-slate-500 mb-6">
                            We've sent an email to <span className="font-medium text-slate-700 dark:text-slate-300">{successEmail}</span> with instructions to join your team.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium py-2.5 rounded-xl transition-all"
                        >
                            Done
                        </button>
                        <button
                            onClick={() => setSuccessEmail(null)}
                            className="mt-3 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            Invite another member
                        </button>
                    </div>
                ) : (
                    <form
                        action={async (formData) => {
                            setIsLoading(true);
                            const email = formData.get("email") as string;
                            const result = await inviteMember(formData);
                            setIsLoading(false);

                            if (result?.error) {
                                // toast.error(result.error); // If we wanted toast on error
                                alert(result.error);
                            } else if (result?.success) {
                                setSuccessEmail(email);
                            }
                        }}
                        className="p-6 space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="colleague@company.com"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                            <select
                                name="role"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <button
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                                {isLoading ? "Sending Invite..." : "Send Invitation"}
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-3">
                                They will receive an email with a link to join your organization.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
