import { SignIn } from "@clerk/nextjs";

export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-3 duration-700">
                    <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-indigo-600/20">T</div>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Welcome back</h1>
                    <p className="text-slate-500 mt-2 text-sm">Sign in to continue to Trace</p>
                </div>
                <div className="flex justify-center">
                    <SignIn appearance={{
                        elements: {
                            card: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 shadow-xl rounded-2xl",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                            socialButtonsBlockButton: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200",
                            formFieldInput: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
                            footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
                            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                        }
                    }} />
                </div>
            </div>
        </div>
    );
}
