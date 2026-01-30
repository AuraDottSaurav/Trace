"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { Resend } from 'resend';

export async function inviteMember(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const role = (formData.get("role") as string) || "member";

    if (!email) return { error: "Email is required" };

    const user = await currentUser();

    if (!user) return { error: "Unauthorized" };

    // Get User's Org
    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id, organizations(name)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) return { error: "You are not in an organization" };

    // Supabase join returns an object or array depending on relationship nature, but with .single() on the main query, it should be an object if 1:1, but sometimes it's an array for generic foreign keys.
    // Cast for safety since we know the schema.
    const orgName = (membership.organizations as any)?.name || "Workspace";

    // Create Invitation
    const { error } = await supabase
        .from("invitations")
        .insert({
            organization_id: membership.organization_id,
            email,
            role,
            invited_by: user.id
        });

    if (error) {
        if (error.code === '23505') return { error: "User already invited." };
        console.error("Invite Error:", error);
        return { error: "Failed to create invitation record." };
    }

    // Real Email Sending with Resend
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        try {
            const { error: emailError } = await resend.emails.send({
                from: 'Trace <onboarding@resend.dev>',
                to: email, // Validated above
                subject: `You've been invited to join ${orgName}`,
                html: `
                    <h1>You've been invited!</h1>
                    <p>${user.firstName || user.emailAddresses[0]?.emailAddress} has invited you to join <strong>${orgName}</strong> on Trace.</p>
                    <p>Log in to accept the invitation.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Log In</a>
                `
            });

            if (emailError) {
                console.error("Resend Error:", emailError);
                return { error: `Invitation created but email failed: ${emailError.message}` };
            }
        } catch (e) {
            console.error("Resend Exception:", e);
        }
    } else {
        console.log("Mock Email: Invited", email);
        return { success: "Invitation created (Mock Mode: Add RESEND_API_KEY to .env.local for real emails)" };
    }

    return { success: `Invitation sent to ${email}` };
}
