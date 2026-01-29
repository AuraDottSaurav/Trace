import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Provider } from "@supabase/supabase-js";

export default async function Login(props: {
    searchParams: Promise<{ message: string }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('[Login Page] Visiting. User ID:', user?.id || 'No user');

    if (user) {
        console.log('[Login Page] User found, redirecting to /dashboard');
        return redirect("/dashboard");
    }
    const signIn = async (formData: FormData) => {
        "use server";

        console.log('[Login Action] Attempting sign in');
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = await createClient();

        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[Login Action] Error:', error.message);
            return redirect(`/login?message=${encodeURIComponent(error.message)}`);
        }

        console.log('[Login Action] Success. User ID:', data.user?.id);

        // Auto-create default organization if none exists (same as OAuth flow)
        if (data.user) {
            const { data: memberships } = await supabase
                .from("organization_members")
                .select("id")
                .eq("user_id", data.user.id)
                .limit(1);

            if (!memberships || memberships.length === 0) {
                const orgName = "My Project";
                const slug = `org-${data.user.id.slice(0, 8)}-${Math.floor(Math.random() * 1000)}`;

                const supabaseAdmin = createAdminClient();

                // Ensure profile exists
                await supabaseAdmin.from("profiles").upsert({
                    id: data.user.id,
                    email: data.user.email,
                }, { onConflict: 'id' });

                const { data: org, error: orgError } = await supabaseAdmin
                    .from("organizations")
                    .insert({
                        name: orgName,
                        slug: slug,
                        owner_id: data.user.id
                    })
                    .select()
                    .single();

                if (org && !orgError) {
                    await supabaseAdmin.from("organization_members").insert({
                        organization_id: org.id,
                        user_id: data.user.id,
                        role: "admin"
                    });
                }
            }
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
            return redirect(`/login?message=${encodeURIComponent(error.message)}`);
        }

        return redirect("/login?message=Check email to continue sign in process");
    };

    const getRedirectUrl = async () => {
        const headerOrigin = (await headers()).get("origin");
        // Prefer environment variable if set (important for production)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (appUrl) return appUrl.replace(/\/$/, ""); // Remove trailing slash if present

        // Fallback to Vercel URL
        const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
        if (vercelUrl) return `https://${vercelUrl}`;

        // Fallback to origin header if usually valid
        if (headerOrigin) return headerOrigin;

        return "http://localhost:3000";
    };

    const signInWithGoogle = async () => {
        "use server";
        const origin = await getRedirectUrl();
        const supabase = await createClient();
        console.log('[Login] Redirecting to:', `${origin}/auth/callback`); // Debug log

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            return redirect(`/login?message=${encodeURIComponent(error.message)}`);
        }

        if (data.url) {
            redirect(data.url);
        }
    };

    const signInWithApple = async () => {
        "use server";
        const origin = await getRedirectUrl();
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) {
            return redirect(`/login?message=${encodeURIComponent(error.message)}`);
        }

        if (data.url) {
            redirect(data.url);
        }
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
                        <p className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-center rounded-lg text-sm">
                            {searchParams.message}
                        </p>
                    )}
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <form>
                        <button
                            formAction={signInWithGoogle}
                            className="w-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2.5 rounded-xl transition-all"
                        >
                            <svg className="h-5 w-5 mr-3" aria-hidden="true" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </form>
                    <form>
                        <button
                            formAction={signInWithApple}
                            className="w-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2.5 rounded-xl transition-all"
                        >
                            <svg className="h-5 w-5 mr-3 text-black dark:text-white" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                            </svg>
                            Apple
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
