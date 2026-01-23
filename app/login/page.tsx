import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function Login({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    const signIn = async (formData: FormData) => {
        "use server";

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = await createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return redirect("/login?message=Could not authenticate user");
        }

        return redirect("/dashboard");
    };

    const signUp = async (formData: FormData) => {
        "use server";

        const origin = (await headers()).get("origin");
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = await createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            return redirect("/login?message=Could not authenticate user");
        }

        return redirect("/login?message=Check email to continue sign in process");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">T</div>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Welcome to Trace</h1>
                    <p className="text-slate-500 mt-2 text-sm">Sign in to your organization</p>
                </div>

                <form className="glass p-8 rounded-2xl shadow-xl border border-white/50 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Email</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-slate-200"
                                name="email"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Password</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-slate-200"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        formAction={signIn}
                        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                        Sign In
                    </button>

                    <div className="mt-4 text-center">
                        <button
                            formAction={signUp}
                            className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            Don't have an account? Sign Up
                        </button>
                    </div>

                    {searchParams?.message && (
                        <p className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-center rounded-lg text-sm">
                            {searchParams.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
