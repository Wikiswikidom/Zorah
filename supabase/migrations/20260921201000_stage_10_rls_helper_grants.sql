-- RLS policies call these private boolean helpers. They reveal no row data and
-- must be executable by authenticated PostgREST requests for policy evaluation.
grant execute on function private.is_staff() to authenticated;
grant execute on function private.has_role(public.user_role) to authenticated;
grant execute on function private.has_catalog_access() to authenticated;
grant execute on function private.has_content_access() to authenticated;
