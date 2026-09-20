-- Separate store campaigns from advertising records so each staff role is least-privilege.
alter table public.campaigns
  add column if not exists channel text not null default 'campaign';

alter table public.campaigns
  drop constraint if exists campaigns_channel_check;

alter table public.campaigns
  add constraint campaigns_channel_check
  check (channel in ('campaign','ad'));

create index if not exists campaigns_channel_status_idx
  on public.campaigns (channel, status, starts_at, ends_at);

drop policy if exists "Anonymous can read active store campaigns" on public.campaigns;
drop policy if exists "Authenticated staff can read scoped campaigns" on public.campaigns;
drop policy if exists "Authenticated staff can create scoped campaigns" on public.campaigns;
drop policy if exists "Authenticated staff can update scoped campaigns" on public.campaigns;
drop policy if exists "Authenticated staff can delete scoped campaigns" on public.campaigns;
drop policy if exists "Anonymous can read active store campaign products" on public.campaign_products;
drop policy if exists "Authenticated staff can read scoped campaign products" on public.campaign_products;
drop policy if exists "Authenticated staff can insert scoped campaign products" on public.campaign_products;
drop policy if exists "Authenticated staff can update scoped campaign products" on public.campaign_products;
drop policy if exists "Authenticated staff can delete scoped campaign products" on public.campaign_products;
drop policy if exists "Anonymous can read active store campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated staff can read scoped campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated staff can insert scoped campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated staff can update scoped campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated staff can delete scoped campaign collections" on public.campaign_collections;

drop policy if exists "Anonymous can read active campaigns" on public.campaigns;
drop policy if exists "Authenticated marketing can create campaigns" on public.campaigns;
drop policy if exists "Authenticated marketing can delete campaigns" on public.campaigns;
drop policy if exists "Authenticated marketing can update campaigns" on public.campaigns;
drop policy if exists "Authenticated users can read campaigns" on public.campaigns;

create policy "Anonymous can read active store campaigns"
on public.campaigns for select to anon
using (
  channel = 'campaign'
  and status = 'live'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

create policy "Authenticated staff can read scoped campaigns"
on public.campaigns for select to authenticated
using (
  (select private.has_role('super_admin'::user_role))
  or ((select private.has_role('marketing_admin'::user_role)) and channel = 'campaign')
  or ((select private.has_role('ads_admin'::user_role)) and channel = 'ad')
  or (
    channel = 'campaign'
    and status = 'live'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  )
);

create policy "Authenticated staff can create scoped campaigns"
on public.campaigns for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (
    (select private.has_role('super_admin'::user_role))
    or ((select private.has_role('marketing_admin'::user_role)) and channel = 'campaign')
    or ((select private.has_role('ads_admin'::user_role)) and channel = 'ad')
  )
);

create policy "Authenticated staff can update scoped campaigns"
on public.campaigns for update to authenticated
using (
  (select private.has_role('super_admin'::user_role))
  or ((select private.has_role('marketing_admin'::user_role)) and channel = 'campaign')
  or ((select private.has_role('ads_admin'::user_role)) and channel = 'ad')
)
with check (
  updated_by = (select auth.uid())
  and (
    (select private.has_role('super_admin'::user_role))
    or ((select private.has_role('marketing_admin'::user_role)) and channel = 'campaign')
    or ((select private.has_role('ads_admin'::user_role)) and channel = 'ad')
  )
);

create policy "Authenticated staff can delete scoped campaigns"
on public.campaigns for delete to authenticated
using (
  (select private.has_role('super_admin'::user_role))
  or ((select private.has_role('marketing_admin'::user_role)) and channel = 'campaign')
  or ((select private.has_role('ads_admin'::user_role)) and channel = 'ad')
);

drop policy if exists "Anonymous can read active campaign products" on public.campaign_products;
drop policy if exists "Authenticated marketing can delete campaign products" on public.campaign_products;
drop policy if exists "Authenticated marketing can insert campaign products" on public.campaign_products;
drop policy if exists "Authenticated marketing can update campaign products" on public.campaign_products;
drop policy if exists "Authenticated users can read campaign products" on public.campaign_products;

create policy "Anonymous can read active store campaign products"
on public.campaign_products for select to anon
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_products.campaign_id
      and c.channel = 'campaign'
      and c.status = 'live'
      and (c.starts_at is null or c.starts_at <= now())
      and (c.ends_at is null or c.ends_at > now())
  )
);

create policy "Authenticated staff can read scoped campaign products"
on public.campaign_products for select to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_products.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
        or (
          c.channel = 'campaign' and c.status = 'live'
          and (c.starts_at is null or c.starts_at <= now())
          and (c.ends_at is null or c.ends_at > now())
        )
      )
  )
);

create policy "Authenticated staff can insert scoped campaign products"
on public.campaign_products for insert to authenticated
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_products.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
);

create policy "Authenticated staff can update scoped campaign products"
on public.campaign_products for update to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_products.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_products.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
);

create policy "Authenticated staff can delete scoped campaign products"
on public.campaign_products for delete to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_products.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
);

drop policy if exists "Anonymous can read active campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated marketing can delete campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated marketing can insert campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated marketing can update campaign collections" on public.campaign_collections;
drop policy if exists "Authenticated users can read campaign collections" on public.campaign_collections;

create policy "Anonymous can read active store campaign collections"
on public.campaign_collections for select to anon
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_collections.campaign_id
      and c.channel = 'campaign'
      and c.status = 'live'
      and (c.starts_at is null or c.starts_at <= now())
      and (c.ends_at is null or c.ends_at > now())
  )
);

create policy "Authenticated staff can read scoped campaign collections"
on public.campaign_collections for select to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_collections.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
        or (
          c.channel = 'campaign' and c.status = 'live'
          and (c.starts_at is null or c.starts_at <= now())
          and (c.ends_at is null or c.ends_at > now())
        )
      )
  )
);

create policy "Authenticated staff can insert scoped campaign collections"
on public.campaign_collections for insert to authenticated
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_collections.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
);

create policy "Authenticated staff can update scoped campaign collections"
on public.campaign_collections for update to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_collections.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_collections.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
);

create policy "Authenticated staff can delete scoped campaign collections"
on public.campaign_collections for delete to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_collections.campaign_id
      and (
        (select private.has_role('super_admin'::user_role))
        or ((select private.has_role('marketing_admin'::user_role)) and c.channel = 'campaign')
        or ((select private.has_role('ads_admin'::user_role)) and c.channel = 'ad')
      )
  )
);
