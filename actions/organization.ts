"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function createOrganization(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("orgName") as string;

    if (!name) return { error: "Organization name is required" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Generate slug from name (simple version)
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

    const supabaseAdmin = createAdminClient();

    // CRM requirement: Ensure profile exists before creating org (self-healing for old users)
    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
            id: user.id,
            email: user.email,
        }, { onConflict: 'id' });

    if (profileError) {
        console.error("Profile Upsert Error:", profileError);
        // We continue, but it might fail if profile really doesn't exist
    }

    // 1. Create Organization
    const { data: org, error: orgError } = await supabaseAdmin
        .from("organizations")
        .insert({
            name,
            slug,
            owner_id: user.id
        })
        .select()
        .single();

    if (orgError) {
        console.error("Org Create Error:", orgError);
        return { error: `Failed to create organization: ${orgError.message}` };
    }

    // 2. Add Owner as Admin Member
    const { error: memberError } = await supabaseAdmin
        .from("organization_members")
        .insert({
            organization_id: org.id,
            user_id: user.id,
            role: "admin"
        });

    if (memberError) {
        console.error("Member Add Error:", memberError);
        return { error: "Created organization but failed to join it." };
    }

    return redirect("/dashboard");
}

export async function getOrganizationMembers(organizationId: string) {
    const supabase = await createClient();

    // Check access first (simplified policy check usually handles this on db side but good to be explicit or if using admin)
    // Here we use standard client so RLS applies.

    const { data, error } = await supabase
        .from("organization_members")
        .select(`
            id,
            role,
            user:user_id (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("organization_id", organizationId);

    if (error) {
        console.error("Get Members Error:", error);
        return [];
    }

    // Flatten structure for easier UI consumption
    return data.map(m => {
        const userData = Array.isArray(m.user) ? m.user[0] : m.user;
        return {
            id: m.id, // Member ID
            role: m.role,
            userId: userData?.id,
            name: userData?.full_name || userData?.email || "Unknown",
            email: userData?.email,
            avatar: userData?.avatar_url
        };
    });
}

export async function updateMemberRole(memberId: string, newRole: "admin" | "member") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // verify requester is admin
    const { data: myMembership } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    if (myMembership?.role !== 'admin') {
        return { error: "Only admins can change roles" };
    }

    // Perform update
    const { error } = await supabase
        .from("organization_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .eq("organization_id", myMembership.organization_id); // Security check

    if (error) return { error: "Failed to update role" };
    return { success: true };
}

export async function removeMember(memberId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // verify requester is admin
    const { data: myMembership } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    if (myMembership?.role !== 'admin') {
        return { error: "Only admins can remove members" };
    }

    const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", myMembership.organization_id); // Security check

    if (error) return { error: "Failed to remove member" };
    return { success: true };
}
