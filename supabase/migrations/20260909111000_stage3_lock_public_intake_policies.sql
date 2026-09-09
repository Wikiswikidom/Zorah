-- Browser clients must submit through validated server routes.
drop policy if exists "public can create contact requests" on public.contact_requests;
drop policy if exists "public can create custom order requests" on public.custom_order_requests;
