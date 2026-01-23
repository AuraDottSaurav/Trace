import Sidebar from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Check if user is part of any organization

    // Check if user is part of any organization
    const { data: memberships } = await supabase
        .from("organization_members")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

    if (!memberships || memberships.length === 0) {
        redirect("/onboarding");
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64 transition-all duration-300 p-8">
                {children}
            </main>
        </div>
    );
}
