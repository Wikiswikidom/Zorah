create or replace function private.write_profile_security_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid()); actor_role public.user_role;
begin
  select role into actor_role from public.profiles where id = actor and is_active = true;
  if actor is not null and actor_role <> 'customer'::public.user_role and
     (tg_op = 'UPDATE' and (old.role is distinct from new.role or old.is_active is distinct from new.is_active)) then
    insert into public.admin_audit_logs(actor_id,actor_role,action,resource_type,resource_id,before_data,after_data,metadata)
    values(actor,actor_role,'SECURITY_CHANGE',tg_table_name,new.id,
      jsonb_build_object('role',old.role,'is_active',old.is_active),
      jsonb_build_object('role',new.role,'is_active',new.is_active),
      jsonb_build_object('changed_fields',array['role','is_active']));
  end if;
  return new;
end;
$$;

revoke execute on function private.write_profile_security_audit() from public, anon, authenticated;

drop trigger if exists staff_profile_security_audit on public.profiles;
create trigger staff_profile_security_audit
after update on public.profiles
for each row execute function private.write_profile_security_audit();

drop policy if exists "Staff access requires MFA" on public.categories;
create policy "Staff access requires MFA"
on public.categories
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.collections;
create policy "Staff access requires MFA"
on public.collections
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.collection_products;
create policy "Staff access requires MFA"
on public.collection_products
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.products;
create policy "Staff access requires MFA"
on public.products
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.product_images;
create policy "Staff access requires MFA"
on public.product_images
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.product_variants;
create policy "Staff access requires MFA"
on public.product_variants
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.inventory_movements;
create policy "Staff access requires MFA"
on public.inventory_movements
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.landing_sections;
create policy "Staff access requires MFA"
on public.landing_sections
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.campaigns;
create policy "Staff access requires MFA"
on public.campaigns
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.campaign_products;
create policy "Staff access requires MFA"
on public.campaign_products
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.campaign_collections;
create policy "Staff access requires MFA"
on public.campaign_collections
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.journal_articles;
create policy "Staff access requires MFA"
on public.journal_articles
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.merchandising_slots;
create policy "Staff access requires MFA"
on public.merchandising_slots
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.publishing_jobs;
create policy "Staff access requires MFA"
on public.publishing_jobs
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.contact_requests;
create policy "Staff access requires MFA"
on public.contact_requests
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.custom_order_requests;
create policy "Staff access requires MFA"
on public.custom_order_requests
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.product_waitlists;
create policy "Staff access requires MFA"
on public.product_waitlists
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.orders;
create policy "Staff access requires MFA"
on public.orders
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.order_items;
create policy "Staff access requires MFA"
on public.order_items
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.order_status_history;
create policy "Staff access requires MFA"
on public.order_status_history
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.payments;
create policy "Staff access requires MFA"
on public.payments
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.admin_audit_logs;
create policy "Staff access requires MFA"
on public.admin_audit_logs
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.site_settings;
create policy "Staff access requires MFA"
on public.site_settings
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff access requires MFA" on public.legal_pages;
create policy "Staff access requires MFA"
on public.legal_pages
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff profile changes require MFA" on public.profiles;
create policy "Staff profile changes require MFA"
on public.profiles
as restrictive
for update
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

drop policy if exists "Staff storage access requires MFA" on storage.objects;
create policy "Staff storage access requires MFA"
on storage.objects
as restrictive
for all
to authenticated
using ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2')
with check ((select private.is_staff()) = false or (select auth.jwt()->>'aal') = 'aal2');

do $$
declare t text;
begin
 foreach t in array array['orders'::text,'order_items'::text,'payments'::text] loop
   execute format('drop trigger if exists admin_audit_trigger on public.%I',t);
   execute format('create trigger admin_audit_trigger after insert or update or delete on public.%I for each row execute function private.write_admin_audit_log()',t);
 end loop;
end $$;
