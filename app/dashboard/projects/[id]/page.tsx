import { createClient } from "@/utils/supabase/server";
import { getProjectDetails } from "@/actions/project";
import { getProjectTasks, getProjectColumns } from "@/actions/tasks";
import { getProjectSprints } from "@/actions/sprints";
import KanbanBoard from "@/components/projects/kanban/KanbanBoard";
import Link from "next/link";
import { ArrowLeft, Settings, Users } from "lucide-react";
import ProjectHeader from "@/components/projects/ProjectHeader";

import { getOrganizationMembers } from "@/actions/organization";

import ProjectView from "@/components/projects/ProjectView";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProjectDetails(id);

    // In a real scenario handle 404
    if (!project) return <div>Project not found</div>;

    const tasks = await getProjectTasks(id);
    const columns = await getProjectColumns(id);
    const sprints = await getProjectSprints(id);
    const members = await getOrganizationMembers(project.organization_id);

    return (
        <ProjectView
            projectId={id}
            project={project}
            tasks={tasks || []}
            columns={columns || []}
            sprints={sprints || []}
            members={members || []}
        />
    );
}

// Helper to fix projectId ref in component
const projectId = "";
