-- 1. DROP EXISTING POLICIES TO AVOID CONFLICTS
drop policy if exists "Users can create organizations" on public.organizations;
drop policy if exists "Users can view organizations they belong to" on public.organizations;
drop policy if exists "Users can view own memberships" on public.organization_members;
drop policy if exists "Users can insert own membership" on public.organization_members;

-- 2. CREATE POLICIES
-- Allow authenticated users to create organizations explicitly
create policy "Users can create organizations" 
on public.organizations 
for insert 
with check (auth.uid() = owner_id);

-- Allow users to view organizations they belong to
create policy "Users can view organizations they belong to" 
on public.organizations 
for select 
using (
  exists (
    select 1 from public.organization_members 
    where organization_id = organizations.id 
    and user_id = auth.uid()
  )
);

-- Allow users to view their own memberships
create policy "Users can view own memberships" 
on public.organization_members 
for select 
using (auth.uid() = user_id);

-- Allow users to insert themselves as members
create policy "Users can insert own membership" 
on public.organization_members 
for insert 
with check (auth.uid() = user_id);

-- 3. ENSURE RLS IS ENABLED
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
