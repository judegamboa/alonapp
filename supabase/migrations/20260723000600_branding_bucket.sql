-- Public branding bucket for workspace logos. Path: {workspace_id}/{file}.
-- Logos render on public-facing portals and emails, so reads are public;
-- writes are limited to the workspace owner.

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true);

create policy "anyone reads branding"
  on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'branding');

create policy "owner manages own branding"
  on storage.objects
  for all to authenticated
  using (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] in (
      select id::text from public.workspaces where owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'branding'
    and (storage.foldername(name))[1] in (
      select id::text from public.workspaces where owner_id = (select auth.uid())
    )
  );
