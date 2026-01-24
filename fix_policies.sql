
-- Enable RLS (just in case)
alter table public.invitations enable row level security;

-- INVITATIONS POLICIES

-- View: Organization Members can view invitations for their organization
create policy "Organization members can view invitations"
on public.invitations for select
using (
  organization_id in (
    select organization_id from public.organization_members
    where user_id = auth.uid()
  )
);

-- Insert: Organization Members can invite others (create invitations)
create policy "Organization members can create invitations"
on public.invitations for insert
with check (
  organization_id in (
    select organization_id from public.organization_members
    where user_id = auth.uid()
  )
);

-- Delete: Organization Members can revoke invitations
create policy "Organization members can revoke invitations"
on public.invitations for delete
using (
  organization_id in (
    select organization_id from public.organization_members
    where user_id = auth.uid()
  )
);
