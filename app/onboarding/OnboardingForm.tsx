"use client";

import { createOrganization } from "../../actions/organization";
import { Building2, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function OnboardingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Setup your Workspace</h1>
                    <p className="text-slate-500 text-lg">Create a new organization to start tracing your projects.</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-xl border border-white/50 dark:border-slate-800">
                    <form
                        action={async (formData) => {
                            const result = await createOrganization(formData);
                            if (result?.error) {
                                alert(result.error);
                                setIsSubmitting(false);
                            }
                        }}
                        onSubmit={() => setIsSubmitting(true)}
                    >
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Organization Name</label>
                            <input
                                name="orgName"
                                type="text"
                                placeholder="e.g. Acme Corp, Design Team..."
                                className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-slate-200"
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? "Creating..." : "Create Workspace"}
                            {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-sm text-slate-400">Have an invite code?</p>
                        <button className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-1 hover:underline">
                            Join existing workspace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
