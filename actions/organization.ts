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
