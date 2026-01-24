-- SPRINTS: Sprints for projects
create table if not exists public.sprints (
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
-- Using do block to safely add columns if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='sprint_id') then
    alter table public.tasks add column sprint_id uuid references public.sprints(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='story_points') then
    alter table public.tasks add column story_points integer;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='task_type') then
    alter table public.tasks add column task_type text check (task_type in ('story', 'bug', 'task', 'epic')) default 'story';
  end if;
end $$;

-- Add index for performance (safe to fail if exists, or check?)
-- Simplest way in Postgres is just run it, if it fails it fails. But helpful to be clean.
create index if not exists idx_sprints_project_id on public.sprints(project_id);
create index if not exists idx_tasks_sprint_id on public.tasks(sprint_id);
