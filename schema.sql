-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES: Extended user data
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORGANIZATIONS: Tenants
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) not null
);

-- ORGANIZATION MEMBERS: Users in Orgs
create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- PROJECTS: Grouping tasks
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  description text,
  key text, -- e.g. "TRC" for task prefixes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

-- TASKS: Updated to be Project-Aware
-- (If 'tasks' already exists, ALTER it. For now, assuming fresh start or migration)
drop table if exists public.tasks;
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('To Do', 'In Progress', 'Done')) default 'To Do',
  priority text check (priority in ('Low', 'Medium', 'High')) default 'Medium',
  due_date timestamp with time zone,
  assignee_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

-- INVITATIONS: Pending invites
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text default 'member',
  token text default uuid_generate_v4() not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  invited_by uuid references public.profiles(id)
);

-- RLS POLICIES (Simplified for initial setup)
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.invitations enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
-- Policy: Users can update their own profile
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
