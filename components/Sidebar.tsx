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


import { useClerk } from "@clerk/nextjs";

import { useTheme } from "next-themes";


// Quick cn utility if not present
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
    user: {
        id?: string;
        email?: string;
        firstName?: string | null;
        lastName?: string | null;
        created_at?: string;
        createdAt?: number | string; // Clerk property
        emailAddresses?: { emailAddress: string }[]; // Clerk property
        user_metadata?: {
            full_name?: string;
            name?: string;
            [key: string]: any;
        };
    };
    organization: { name?: string } | null;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ user, organization, collapsed, setCollapsed }: SidebarProps) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const pathname = usePathname();

    // Helper to get display name
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : null) || user?.email || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0];

    // Format join date
    const dateValue = user?.createdAt || user?.created_at;
    const joinDate = dateValue ? new Date(dateValue).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close profile when clicking outside (simple implementation)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showProfile && !target.closest('.user-profile-trigger') && !target.closest('.user-profile-popup')) {
                setShowProfile(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showProfile]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const { signOut } = useClerk();

    const handleLogout = async () => {
        await signOut({ redirectUrl: "/login" });
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
                        T
                    </div>
                    <span className={classNames("font-bold text-xl whitespace-nowrap transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient-text", collapsed ? "w-0 opacity-0 px-0" : "w-auto opacity-100 pl-3")}>
                        Trace
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 w-full mb-2 relative">

                {/* Profile Modal */}
                {showProfile && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowProfile(false);
                        }}
                    >
                        {/* Modal Content */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm relative animate-in zoom-in-95 duration-200">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowProfile(false)}
                                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <ChevronRight size={16} className="rotate-90" /> {/* Reusing Chevron as close X equivalent or just replace with X icon if imported, but ChevronRight is already imported. Actually, X (Lucide 'X') is better but not imported. Let's stick to simple click outside or add X if I import it. I'll just rely on click outside + maybe a simple Close text or icon if available. I see 'LogOut' is available. Let's just use click outside logic mainly, but maybe a clean header? I'll keep it simple as requested: "directly show the center aligned pop up with all the details". */}
                            </button>

                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-3xl mb-4 shadow-inner">
                                    {displayName?.[0]?.toUpperCase()}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{displayName}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 mt-3">
                                    Free Plan
                                </span>
                            </div>

                            <div className="space-y-4 py-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Member since</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{joinDate}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">User ID</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 font-mono text-xs bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded select-all" title={user?.id}>
                                        {user?.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    onClick={() => setShowProfile(!showProfile)}
                    className={classNames(
                        "user-profile-trigger bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center overflow-hidden mb-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors",
                        collapsed ? "justify-center p-2 mx-auto w-10 h-10" : "gap-3"
                    )}
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-medium flex-shrink-0 text-xs">
                        {displayName?.[0]?.toUpperCase()}
                    </div>
                    <div className={classNames("flex-1 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block")}>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{displayName}</p>
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
