create table if not exists public.site_settings (
  key text primary key check (key in ('site_logo', 'site_favicon')),
  media_path text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
drop policy if exists "site_settings_admin_write" on public.site_settings;

insert into public.site_settings(key, media_path)
values ('site_logo', null), ('site_favicon', null)
on conflict (key) do nothing;
