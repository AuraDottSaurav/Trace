"use client";

import { Sparkles } from "lucide-react";

export default function DashboardHome() {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? "Good Morning" : hours < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="max-w-4xl mx-auto pt-20 flex flex-col items-center text-center">
            <h1 className="text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                {greeting}, Saurav
            </h1>
            <p className="text-slate-500 text-lg mb-12">
                What would you like to achieve today?
            </p>

            {/* Center Omnibar */}
            <div className="w-full max-w-2xl relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative glass rounded-2xl p-2 pl-4 flex items-center gap-3 shadow-xl border border-white/50 dark:border-slate-700/50">
                    <div className="bg-indigo-600/10 p-2 rounded-lg">
                        <Sparkles className="text-indigo-600" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Describe your task or project..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 h-10"
                    />
                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20">
                        Create
                    </button>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                {/* Quick Stats or Recent Activity Cards would go here */}
            </div>
        </div>
    );
}
