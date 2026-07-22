-- Storage bucket for shared files. Path convention: {workspace_id}/{client_id}/{filename}.
-- Policies mirror the files table: freelancer manages own workspace's prefix,
-- client reads own prefix only (client uploads are v2; RLS spec allows client
-- INSERT on messages only).

insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false);

create policy "freelancer manages own workspace files"
  on storage.objects
  for all to authenticated
  using (
    bucket_id = 'client-files'
    and (storage.foldername(name))[1] in (
      select id::text from public.workspaces where owner_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'client-files'
    and (storage.foldername(name))[1] in (
      select id::text from public.workspaces where owner_id = (select auth.uid())
    )
  );

create policy "client reads own files"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-files'
    and (storage.foldername(name))[2] = private.jwt_client_id()::text
  );
