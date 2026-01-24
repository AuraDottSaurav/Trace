"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProjectSprints(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching sprints:", JSON.stringify(error, null, 2));
        return [];
    }

    return data;
}

export async function createSprint(projectId: string, name: string, goal?: string, startDate?: string, endDate?: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("sprints")
        .insert({
            project_id: projectId,
            name,
            goal,
            start_date: startDate,
            end_date: endDate,
            status: "future"
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating sprint:", error);
        return null;
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return data;
}

export async function updateSprintStatus(sprintId: string, status: "active" | "future" | "closed") {
    const supabase = await createClient();
    const { error } = await supabase
        .from("sprints")
        .update({ status })
        .eq("id", sprintId);

    if (error) {
        console.error("Error updating sprint status:", error);
        return false;
    }

    // specific path revalidation might depend on where this is called, but generally project page
    return true;
}

export async function updateSprint(sprintId: string, updates: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("sprints")
        .update(updates)
        .eq("id", sprintId)
        .select()
        .single();

    if (error) {
        console.error("Error updating sprint:", error);
        return null;
    }

    return data;
}
