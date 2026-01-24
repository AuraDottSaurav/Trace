-- KANBAN COLUMNS: Stages for projects
create table public.kanban_columns (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  position integer not null default 0,
  color text, -- For UI badging
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for kanban_columns
alter table public.kanban_columns enable row level security;

-- Policies for kanban_columns
create policy "Users can view project columns" on public.kanban_columns for select using (
  project_id in (
    select id from public.projects
    where organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  )
);

create policy "Users can manage project columns" on public.kanban_columns for all using (
  project_id in (
    select id from public.projects
    where organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  )
);

-- Update TASKS table to reference columns
alter table public.tasks add column column_id uuid references public.kanban_columns(id) on delete set null;

-- Add index for performance
create index idx_kanban_columns_project_id on public.kanban_columns(project_id);
create index idx_tasks_column_id on public.tasks(column_id);

-- SPRINTS: Sprints for projects
create table public.sprints (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  status text check (status in ('active', 'future', 'closed')) default 'future',
  goal text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for sprints
alter table public.sprints enable row level security;

-- Policies for sprints (matching project access)
create policy "Users can view project sprints" on public.sprints for select using (
  project_id in (
    select id from public.projects
    where organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  )
);

create policy "Users can manage project sprints" on public.sprints for all using (
  project_id in (
    select id from public.projects
    where organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  )
);

-- Update TASKS table to reference sprints and add story points
alter table public.tasks add column sprint_id uuid references public.sprints(id) on delete set null;
alter table public.tasks add column story_points integer;
alter table public.tasks add column task_type text check (task_type in ('story', 'bug', 'task', 'epic')) default 'story';

-- Add index for performance
create index idx_sprints_project_id on public.sprints(project_id);
create index idx_tasks_sprint_id on public.tasks(sprint_id);
