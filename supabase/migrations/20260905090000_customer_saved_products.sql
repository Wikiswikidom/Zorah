create table if not exists public.customer_wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.customer_recently_viewed (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists customer_recently_viewed_user_viewed_idx on public.customer_recently_viewed(user_id, viewed_at desc);

alter table public.customer_wishlists enable row level security;
alter table public.customer_recently_viewed enable row level security;

drop policy if exists customer_wishlists_select_own on public.customer_wishlists;
drop policy if exists customer_wishlists_insert_own on public.customer_wishlists;
drop policy if exists customer_wishlists_delete_own on public.customer_wishlists;
create policy customer_wishlists_select_own on public.customer_wishlists for select to authenticated using (user_id = auth.uid());
create policy customer_wishlists_insert_own on public.customer_wishlists for insert to authenticated with check (user_id = auth.uid());
create policy customer_wishlists_delete_own on public.customer_wishlists for delete to authenticated using (user_id = auth.uid());

drop policy if exists customer_recently_viewed_select_own on public.customer_recently_viewed;
drop policy if exists customer_recently_viewed_insert_own on public.customer_recently_viewed;
drop policy if exists customer_recently_viewed_update_own on public.customer_recently_viewed;
drop policy if exists customer_recently_viewed_delete_own on public.customer_recently_viewed;
create policy customer_recently_viewed_select_own on public.customer_recently_viewed for select to authenticated using (user_id = auth.uid());
create policy customer_recently_viewed_insert_own on public.customer_recently_viewed for insert to authenticated with check (user_id = auth.uid());
create policy customer_recently_viewed_update_own on public.customer_recently_viewed for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy customer_recently_viewed_delete_own on public.customer_recently_viewed for delete to authenticated using (user_id = auth.uid());
