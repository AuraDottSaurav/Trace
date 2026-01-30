import DashboardShell from "@/components/DashboardShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
        console.log("[DashboardLayout] No user, redirecting to login");
        redirect("/login");
    }

    console.log("[DashboardLayout] Checking membership for user:", user.id);

    // Check if user is part of any organization
    const { data: membership, error: memberError } = await supabase
        .from("organization_members")
        .select("*, organizations(*)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (memberError) {
        console.error("[DashboardLayout] Membership query error FULL OBJECT:", JSON.stringify(memberError, null, 2));
    }

    if (!membership) {
        console.log("[DashboardLayout] No membership found, redirecting to onboarding");
        redirect("/onboarding");
    }

    console.log("[DashboardLayout] Membership found:", membership.id);

    return (
        <DashboardShell user={JSON.parse(JSON.stringify(user))} organization={membership.organizations}>
            {children}
        </DashboardShell>
    );
}
