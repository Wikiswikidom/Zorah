create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  provider text not null default 'paystack',
  reference text,
  transaction_id bigint,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payment_webhook_events_reference_idx on public.payment_webhook_events(reference);
create index if not exists payment_webhook_events_created_at_idx on public.payment_webhook_events(created_at desc);

alter table public.payments
  add column if not exists transaction_id bigint,
  add column if not exists refunded_amount numeric not null default 0 check (refunded_amount >= 0),
  add column if not exists refund_reference text,
  add column if not exists refund_status text check (refund_status is null or refund_status in ('pending','processing','processed','failed','needs-attention'));

create index if not exists payments_transaction_id_idx on public.payments(transaction_id);
create unique index if not exists payments_refund_reference_uidx on public.payments(refund_reference) where refund_reference is not null;

alter table public.payment_webhook_events enable row level security;
revoke all on public.payment_webhook_events from anon, authenticated;
revoke all on public.payment_webhook_events from public;
revoke all on public.payment_webhook_events from service_role;
grant all on public.payment_webhook_events to service_role;

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
