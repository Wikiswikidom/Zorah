begin;

select plan(8);

select ok(
  (select count(*) from pg_tables where schemaname='public' and rowsecurity) = 30,
  'All public application tables have RLS enabled'
);

select ok(
  has_function_privilege('authenticated', 'private.is_staff()', 'EXECUTE'),
  'authenticated can execute the non-data-leaking staff helper used by RLS'
);

select ok(
  has_function_privilege('authenticated', 'private.has_role(public.user_role)', 'EXECUTE'),
  'authenticated can execute the role boolean helper used by RLS'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='products'
      and policyname='Staff access requires MFA'
      and permissive = 'RESTRICTIVE'
  ),
  'products has a restrictive staff MFA policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='orders'
      and policyname='Staff access requires MFA'
      and permissive = 'RESTRICTIVE'
  ),
  'orders has a restrictive staff MFA policy'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='Staff storage access requires MFA'
      and permissive = 'RESTRICTIVE'
  ),
  'storage operations have a restrictive staff MFA policy'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgname='staff_profile_security_audit'
  ),
  'staff role and activation changes have a dedicated security audit trigger'
);

select ok(
  exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    where c.relname='payments' and t.tgname='admin_audit_trigger'
  ),
  'payment mutations are covered by the admin audit trigger'
);

select * from finish();
rollback;
