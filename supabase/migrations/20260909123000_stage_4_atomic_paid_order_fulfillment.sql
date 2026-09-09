create or replace function public.finalize_paid_order(p_order_id uuid, p_reference text, p_amount numeric, p_currency text, p_channel text default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_existing_payment public.payments%rowtype;
begin
  if p_order_id is null or p_reference is null or length(trim(p_reference)) = 0 then
    raise exception 'Invalid payment confirmation input';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.order_number <> trim(p_reference)
     or v_order.currency <> upper(trim(p_currency))
     or v_order.total <> p_amount then
    raise exception 'Payment does not match order';
  end if;

  if v_order.payment_status = 'refunded' then return false; end if;
  if v_order.payment_status = 'paid' then return true; end if;

  select * into v_existing_payment from public.payments where reference = trim(p_reference) for update;
  if found and v_existing_payment.order_id <> v_order.id then
    raise exception 'Payment reference is already attached to another order';
  end if;

  for v_item in
    select oi.variant_id, oi.quantity, oi.product_name, oi.variant_name
    from public.order_items oi
    where oi.order_id = v_order.id and oi.variant_id is not null
  loop
    insert into public.inventory_movements
      (variant_id, quantity_delta, reason, reference, notes, created_by)
    values
      (v_item.variant_id, -v_item.quantity, 'sale', trim(p_reference),
       'Paid order ' || v_order.order_number || ': ' || v_item.product_name || ' (' || coalesce(v_item.variant_name, 'Default') || ')',
       v_order.user_id);
  end loop;

  update public.orders
  set payment_status='paid',
      status=case when status='pending' then 'processing' else status end,
      paystack_reference=trim(p_reference),
      updated_at=now()
  where id=v_order.id;

  insert into public.payments
    (order_id, provider, reference, amount, currency, status, paid_at, metadata)
  values
    (v_order.id, 'paystack', trim(p_reference), p_amount, upper(trim(p_currency)), 'paid', now(),
     jsonb_build_object('channel', p_channel))
  on conflict (reference) do update
    set status='paid', paid_at=excluded.paid_at, metadata=excluded.metadata, updated_at=now()
    where public.payments.order_id=excluded.order_id;

  return true;
end;
$$;

revoke execute on function public.finalize_paid_order(uuid,text,numeric,text,text) from public, anon, authenticated;
grant execute on function public.finalize_paid_order(uuid,text,numeric,text,text) to service_role;

create index if not exists legal_pages_updated_by_idx on public.legal_pages(updated_by);
