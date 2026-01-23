
import { createOrganization } from "@/actions/organization";
import { Building2, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
    // Server-side check for pending invites
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email) {
        const { data: invitations } = await supabase
            .from("invitations")
            .select("*")
            .eq("email", user.email)
            .eq("status", "pending");

        if (invitations && invitations.length > 0) {
            // Auto-accept first invite (for MVP)
            const invite = invitations[0];

            // Add to members
            await supabase.from("organization_members").insert({
                organization_id: invite.organization_id,
                user_id: user.id,
                role: invite.role
            });

            // Update invite status
            await supabase.from("invitations").update({ status: "accepted" }).eq("id", invite.id);

            // Redirect to dashboard
            redirect("/dashboard");
        }
    }

    return <OnboardingForm />;
}
