"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTask(projectId: string, formData: FormData) {
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const columnId = formData.get("columnId") as string;
    const priority = formData.get("priority") as string || "Medium";
    const assigneeId = formData.get("assigneeId") as string;
    const dueDate = formData.get("dueDate") as string;

    if (!title) return { error: "Task title is required" };
    if (!columnId) return { error: "Column ID is required" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from("tasks")
        .insert({
            project_id: projectId,
            column_id: columnId,
            title,
            description,
            priority,
            assignee_id: assigneeId || null,
            due_date: dueDate || null,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        console.error("Create Task Error:", error);
        return { error: error.message };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, task: data };
}

export async function updateTaskColumn(taskId: string, columnId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("tasks")
        .update({ column_id: columnId })
        .eq("id", taskId);

    if (error) return { error: error.message };

    return { success: true };
}

export async function updateTask(taskId: string, updates: any) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/projects", "layout");
    return { success: true };
}

export async function deleteTask(taskId: string) {
    const supabase = await createClient();

    // Get project ID for revalidation before deletion
    const { data: task } = await supabase.from("tasks").select("project_id").eq("id", taskId).single();

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

    if (error) return { error: error.message };

    if (task) {
        revalidatePath(`/dashboard/projects/${task.project_id}`);
    }

    return { success: true };
}

export async function getProjectTasks(projectId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tasks")
        .select(`
            *,
            assignee:assignee_id (
                full_name,
                avatar_url,
                email
            ),
            created_by:created_by (
                full_name
            )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Get Tasks Error:", error);
        return [];
    }
    return data;
}

export async function getProjectColumns(projectId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("kanban_columns")
        .select("*")
        .eq("project_id", projectId)
        .order("position", { ascending: true });

    if (error) {
        console.error("Get Columns Error:", error);
        return [];
    }
    return data;
}
