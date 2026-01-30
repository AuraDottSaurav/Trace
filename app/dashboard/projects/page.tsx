
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import ProjectList from "./ProjectList";

export default async function ProjectsPage() {
    const supabase = await createClient();
    const user = await currentUser();

    if (!user) {
        redirect("/login");
    }

    // Get Organization ID
    const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .limit(1)
        .single();

    // Fetch Projects
    const { data: projects } = await supabase
        .from("projects")
        .select("*, tasks(count)") // Getting task count using Supabase count
        .eq("organization_id", membership?.organization_id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <ProjectList projects={projects || []} />
        </div>
    );
}
