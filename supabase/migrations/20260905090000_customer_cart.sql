create table if not exists public.customer_cart (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  variant text not null default 'Default',
  quantity integer not null default 1 check (quantity between 1 and 99),
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_slug, variant)
);

create index if not exists customer_cart_user_updated_idx on public.customer_cart(user_id, updated_at desc);

alter table public.customer_cart enable row level security;

drop policy if exists customer_cart_select_own on public.customer_cart;
drop policy if exists customer_cart_insert_own on public.customer_cart;
drop policy if exists customer_cart_update_own on public.customer_cart;
drop policy if exists customer_cart_delete_own on public.customer_cart;
create policy customer_cart_select_own on public.customer_cart for select to authenticated using (user_id = auth.uid());
create policy customer_cart_insert_own on public.customer_cart for insert to authenticated with check (user_id = auth.uid());
create policy customer_cart_update_own on public.customer_cart for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy customer_cart_delete_own on public.customer_cart for delete to authenticated using (user_id = auth.uid());

create or replace function public.set_customer_cart_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_cart_updated_at on public.customer_cart;
create trigger customer_cart_updated_at before update on public.customer_cart for each row execute function public.set_customer_cart_updated_at();
