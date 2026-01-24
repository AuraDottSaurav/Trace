import DashboardShell from "@/components/DashboardShell";
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
    const { data: membership } = await supabase
        .from("organization_members")
        .select("*, organizations(*)")
        .eq("user_id", user.id)
        .single();

    if (!membership) {
        redirect("/onboarding");
    }

    return (
        <DashboardShell user={user} organization={membership.organizations}>
            {children}
        </DashboardShell>
    );
}
