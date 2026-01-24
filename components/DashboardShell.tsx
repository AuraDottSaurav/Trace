"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/utils/cn"; // Ensure this import path is correct or use classNames helper inline if utils/cn doesn't exist (I recall I used classNames inline in Sidebar, I should convert to that or be consistent)

// Simple classNames helper if utils/cn is missing or just to be safe and consistent with previous Sidebar code
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface DashboardShellProps {
    user: any;
    organization: any;
    children: React.ReactNode;
}

export default function DashboardShell({ user, organization, children }: DashboardShellProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar
                user={user}
                organization={organization}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <main
                className={classNames(
                    "flex-1 transition-all duration-300 p-8",
                    collapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
                )}
            >
                {children}
            </main>
        </div>
    );
}
