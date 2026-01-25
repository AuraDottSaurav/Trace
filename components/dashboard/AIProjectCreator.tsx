"use client";

import { ArrowUp, AppWindow, Megaphone, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ParticleBackground from "./ParticleBackground";
import MouseTrail from "./MouseTrail";

export default function AIProjectCreator() {
    const templates = [
        {
            category: "Marketing",
            items: [
                { title: "Campaign Launch", desc: "Roadmap, Content Calendar, Review", gradient: "from-pink-500 to-rose-500" },
                { title: "Social Media", desc: "Weekly Planner, Analytics", gradient: "from-orange-400 to-pink-500" },
            ]
        },
        {
            category: "Development",
            items: [
                { title: "Software Roadmap", desc: "Epics, Sprints, Backlog", gradient: "from-blue-500 to-indigo-600" },
                { title: "Bug Tracking", desc: "Triage, Severity, Fixes", gradient: "from-cyan-500 to-blue-500" },
            ]
        },
        {
            category: "Operations",
            items: [
                { title: "Hiring Pipeline", desc: "Candidates, Interviews, Offers", gradient: "from-emerald-400 to-teal-500" },
                { title: "Inventory", desc: "Stock, Orders, Suppliers", gradient: "from-green-500 to-emerald-600" },
            ]
        }
    ];

    return (
        <div className="w-full h-full relative overflow-hidden overflow-x-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
                {/* Grid Pattern - Increased opacity for dark mode */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]"></div>
                {/* Vignette Mask */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#00000000,transparent)] pointer-events-none" />
                {/* Side Fade Mask */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 via-transparent to-slate-50/80 dark:from-slate-950/80 dark:via-transparent dark:to-slate-950/80" />

                <ParticleBackground />
                <MouseTrail />
            </div>

            <div className="w-full max-w-5xl mx-auto flex flex-col h-full relative z-10">
                {/* Hero Section */}
                <div className="flex-none flex flex-col items-center justify-center min-h-[50vh] pt-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 via-indigo-500 to-teal-400 bg-clip-text text-transparent mb-10 text-center tracking-tight animate-gradient-text">
                        What will you build today?
                    </h1>

                    <div className="w-full max-w-3xl relative group">
                        {/* Gradient Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-60" />

                        {/* Chat Box */}
                        <div className="relative w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col min-h-[160px] transition-all duration-300">
                            <Textarea
                                placeholder="Describe your project, roadmap, or campaign..."
                                className="w-full bg-transparent border-none focus-visible:ring-0 resize-none text-xl min-h-[100px] max-h-[220px] shadow-none p-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium"
                                autoFocus
                            />

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <Megaphone size={14} className="text-indigo-500" />
                                    <span>AI Agent active</span>
                                </div>
                                <Button
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
                                    size="icon"
                                >
                                    <ArrowUp size={20} strokeWidth={2.5} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Showcase Section - Pushed to bottom */}
                <div className="flex-1 flex flex-col justify-end pb-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-lg">
                                <AppWindow size={20} className="text-indigo-500" />
                                <span>Templates Showcase</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {templates.map((cat) => (
                                <div key={cat.category} className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{cat.category}</h3>
                                    <div className="space-y-3">
                                        {cat.items.map((item) => (
                                            <div key={item.title} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-start gap-4 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-1 duration-300">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex-shrink-0 shadow-inner flex items-center justify-center text-white/90`}>
                                                    <FolderKanban size={20} className="opacity-75" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
