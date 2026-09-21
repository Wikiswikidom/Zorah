-- Stage 10: database security hardening
alter function private.has_catalog_access() set search_path = '';
alter function private.has_content_access() set search_path = '';
alter function private.has_role(user_role) set search_path = '';
alter function private.is_staff() set search_path = '';
alter function public.handle_new_user() set search_path = '';
alter function public.has_role(user_role) set search_path = '';
alter function public.is_staff() set search_path = '';

revoke execute on function private.has_catalog_access() from public, anon, authenticated;
revoke execute on function private.has_content_access() from public, anon, authenticated;
revoke execute on function private.has_role(user_role) from public, anon, authenticated;
revoke execute on function private.is_staff() from public, anon, authenticated;
revoke execute on function public.has_role(user_role) from public, anon, authenticated;
revoke execute on function public.is_staff() from public, anon, authenticated;

drop policy if exists "staff can delete order status history" on public.order_status_history;
drop policy if exists "staff can insert order status history" on public.order_status_history;
drop policy if exists "staff can update order status history" on public.order_status_history;
drop policy if exists "order staff can delete order status history" on public.order_status_history;
drop policy if exists "order staff can insert order status history" on public.order_status_history;
drop policy if exists "order staff can update order status history" on public.order_status_history;

create policy "order staff can insert order status history"
on public.order_status_history for insert to authenticated
with check ((select private.has_role('order_admin'::user_role)));

create policy "order staff can update order status history"
on public.order_status_history for update to authenticated
using ((select private.has_role('order_admin'::user_role)))
with check ((select private.has_role('order_admin'::user_role)));

create policy "order staff can delete order status history"
on public.order_status_history for delete to authenticated
using ((select private.has_role('order_admin'::user_role)));
