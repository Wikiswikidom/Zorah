-- Security hardening: site_settings contains internal audit metadata.
-- Public clients should read the fixed public logo through /api/branding/logo,
-- not query the table directly.
drop policy if exists "site_settings_select_public" on public.site_settings;
