drop policy if exists payments_customer_select_own on public.payments;
drop policy if exists payments_order_admin_select on public.payments;
create policy payments_select_access on public.payments for select to authenticated using (
  exists (select 1 from public.orders o where o.id=payments.order_id and o.user_id=(select auth.uid()))
  or (select private.has_role('order_admin'::user_role))
);
