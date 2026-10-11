-- Phase 2: prevent repeated checkout submissions from creating duplicate orders.
-- Nullable for backward compatibility with historical orders and existing admin workflows.
alter table public.orders
  add column if not exists checkout_idempotency_key text;

create unique index if not exists orders_user_checkout_idempotency_key_uidx
  on public.orders (user_id, checkout_idempotency_key)
  where checkout_idempotency_key is not null;

comment on column public.orders.checkout_idempotency_key is
  'Client-generated key used to safely retry the same checkout attempt; unique per customer.';
