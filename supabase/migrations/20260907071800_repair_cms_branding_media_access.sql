-- CMS media and branding settings are managed through authenticated server routes.
-- Keep the service-role key out of the browser while allowing approved content staff
-- to use the normal Supabase SSR client for reads and writes.

drop policy if exists "Content staff upload landing media public bucket" on storage.objects;
drop policy if exists "Content staff update landing media public bucket" on storage.objects;
drop policy if exists "Content staff delete landing media public bucket" on storage.objects;

create policy "Content staff upload landing media public bucket"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'landing-media'
  and name like 'landing/%'
  and (select private.has_content_access())
);

create policy "Content staff update landing media public bucket"
on storage.objects for update to authenticated
using (
  bucket_id = 'landing-media'
  and name like 'landing/%'
  and (select private.has_content_access())
)
with check (
  bucket_id = 'landing-media'
  and name like 'landing/%'
  and (select private.has_content_access())
);

create policy "Content staff delete landing media public bucket"
on storage.objects for delete to authenticated
using (
  bucket_id = 'landing-media'
  and name like 'landing/%'
  and (select private.has_content_access())
);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
on public.site_settings for all to authenticated
using ((select private.has_content_access()))
with check ((select private.has_content_access()));

update storage.buckets
set allowed_mime_types = array[
  'image/png','image/jpeg','image/webp','image/svg+xml','image/x-icon','image/vnd.microsoft.icon','image/avif'
]::text[]
where id = 'brand-assets';
