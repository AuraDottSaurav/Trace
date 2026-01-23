"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function createOrganization(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("orgName") as string;

    if (!name) return { error: "Organization name is required" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Generate slug from name (simple version)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // 1. Create Organization
    const { data: org, error: orgError } = await supabase
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
        return { error: "Failed to create organization. Slug might be taken." };
    }

    // 2. Add Owner as Admin Member
    const { error: memberError } = await supabase
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
