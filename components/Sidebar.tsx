"use client";

import { useEffect, useState } from "react";
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


import { createClient } from "@/utils/supabase/client";

import { useTheme } from "next-themes";


// Quick cn utility if not present
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
    user: { email?: string };
    organization: { name?: string } | null;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ user, organization, collapsed, setCollapsed }: SidebarProps) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
        { name: "Team", href: "/dashboard/team", icon: Users },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    if (!mounted) return (
        <aside className="h-screen bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 fixed left-0 top-0 z-50 transition-all duration-300">
            {/* Skeleton state to prevent hydration mismatch if needed, or return null */}
        </aside>
    );

    return (
        <aside
            className={classNames(
                "h-screen bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 group",
                collapsed ? "w-20 items-center" : "w-64"
            )}
        >
            {/* Header */}
            <div className={classNames("h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 w-full relative", collapsed ? "justify-center" : "justify-between")}>
                <div className={classNames("flex items-center overflow-hidden", collapsed ? "gap-0" : "gap-3")}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold">
                        {organization?.name?.[0] || "T"}
                    </div>
                    <span className={classNames("font-semibold text-lg text-slate-800 dark:text-slate-100 whitespace-nowrap transition-all duration-300", collapsed ? "w-0 opacity-0 px-0" : "w-auto opacity-100 pl-3")}>
                        {organization?.name || "Trace"}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className={classNames(
                        "p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors absolute right-4 top-5 z-50",
                        collapsed ? "opacity-0 group-hover:opacity-100 right-[-12px] bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 rounded-full" : ""
                    )}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 w-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={classNames(
                                "flex items-center px-3 py-2.5 rounded-xl transition-all group overflow-hidden h-11",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium"
                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
                                collapsed ? "justify-center" : "justify-start gap-3"
                            )}
                        >
                            <item.icon size={20} className={classNames("flex-shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                            <span className={classNames("whitespace-nowrap transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Tenant Info */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 w-full mb-2">
                <div className={classNames("bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center overflow-hidden mb-4", collapsed ? "justify-center p-2 mx-auto w-10 h-10" : "gap-3")}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-medium flex-shrink-0 text-xs">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className={classNames("flex-1 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block")}>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.email}</p>
                        <p className="text-xs text-slate-400 truncate">Free Plan</p>
                    </div>
                </div>

                <div className={classNames("flex gap-2", collapsed ? "flex-col items-center" : "justify-between")}>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
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
