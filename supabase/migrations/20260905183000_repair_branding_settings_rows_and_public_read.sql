insert into public.site_settings(key, media_path)
values ('site_logo', null), ('site_favicon', null)
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public"
on public.site_settings for select
to anon, authenticated
using (true);
