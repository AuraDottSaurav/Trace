"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    LogOut,
    Building2
} from "lucide-react";
import { cn } from "../utils/cn"; // Assuming you have a cn utility, if not I will create it or use clsx/tailwind-merge inline

// Quick cn utility if not present
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isDark, setIsDark] = useState(false); // This will need real theme context later
    const pathname = usePathname();

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
        { name: "Team", href: "/dashboard/team", icon: Users },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <aside
            className={classNames(
                "h-screen bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col fixed left-0 top-0 z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold">T</div>
                    <span className={classNames("font-semibold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap transition-opacity", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                        Trace
                    </span>
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={classNames(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium"
                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            <item.icon size={20} className={classNames("flex-shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                            <span className={classNames("whitespace-nowrap transition-all", collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Tenant Info */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className={classNames("bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3", collapsed ? "justify-center p-2" : "")}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <Building2 size={16} />
                    </div>
                    <div className={classNames("flex-1 overflow-hidden", collapsed ? "hidden" : "block")}>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">Acme Corp</p>
                        <p className="text-xs text-slate-400 truncate">Free Plan</p>
                    </div>
                </div>

                <div className={classNames("mt-4 flex gap-2", collapsed ? "flex-col items-center" : "justify-between")}>
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Toggle Theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
