"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const key = formData.get("key") as string; // e.g. "WEB"

    if (!name) return { error: "Project name is required" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Get User's Org
    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

    if (!membership) return { error: "No organization found" };

    const { error } = await supabase
        .from("projects")
        .insert({
            organization_id: membership.organization_id,
            name,
            description,
            key: key?.toUpperCase(),
            created_by: user.id
        });

    if (error) {
        console.error("Create Project Error:", error);
        return { error: "Failed to create project" };
    }

    revalidatePath("/dashboard");
    return { success: true };
}
