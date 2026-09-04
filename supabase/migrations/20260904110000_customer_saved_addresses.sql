create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Default',
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  country text not null default 'Nigeria',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_addresses_user_idx on public.customer_addresses(user_id, is_default desc, updated_at desc);
alter table public.customer_addresses enable row level security;
create policy customer_addresses_select_own on public.customer_addresses for select to authenticated using (user_id = auth.uid());
create policy customer_addresses_insert_own on public.customer_addresses for insert to authenticated with check (user_id = auth.uid());
create policy customer_addresses_update_own on public.customer_addresses for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy customer_addresses_delete_own on public.customer_addresses for delete to authenticated using (user_id = auth.uid());
create or replace function public.set_customer_address_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists customer_addresses_updated_at on public.customer_addresses;
create trigger customer_addresses_updated_at before update on public.customer_addresses for each row execute function public.set_customer_address_updated_at();
