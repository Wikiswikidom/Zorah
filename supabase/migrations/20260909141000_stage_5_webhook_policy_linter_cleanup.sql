drop policy if exists payment_webhook_events_service_role_all on public.payment_webhook_events;
create policy payment_webhook_events_service_role_all on public.payment_webhook_events
  for all to service_role
  using (true)
  with check (true);
