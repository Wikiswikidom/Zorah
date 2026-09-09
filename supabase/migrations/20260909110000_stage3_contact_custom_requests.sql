-- Stage 3: public contact intake + authenticated bespoke requests.
-- Customer uploads are kept in a private bucket and are only accessed server-side by authorized staff.

alter table public.custom_order_requests
  add column if not exists reference_image_path text,
  add column if not exists reference_image_name text;

create index if not exists idx_contact_requests_created_at on public.contact_requests(created_at desc);
create index if not exists idx_contact_requests_status_created_at on public.contact_requests(status, created_at desc);
create index if not exists idx_contact_requests_email on public.contact_requests(lower(email));
create index if not exists idx_custom_order_requests_customer_created_at on public.custom_order_requests(customer_id, created_at desc);
create index if not exists idx_custom_order_requests_status_created_at on public.custom_order_requests(status, created_at desc);

-- Keep intake data bounded even if the API is bypassed.
alter table public.contact_requests drop constraint if exists contact_requests_message_length;
alter table public.contact_requests add constraint contact_requests_message_length check (char_length(message) between 2 and 5000);
alter table public.contact_requests drop constraint if exists contact_requests_name_length;
alter table public.contact_requests add constraint contact_requests_name_length check (char_length(name) between 2 and 160);
alter table public.contact_requests drop constraint if exists contact_requests_email_length;
alter table public.contact_requests add constraint contact_requests_email_length check (char_length(email) between 3 and 320);

alter table public.custom_order_requests drop constraint if exists custom_order_requests_details_length;
alter table public.custom_order_requests add constraint custom_order_requests_details_length check (char_length(details) between 2 and 5000);
alter table public.custom_order_requests drop constraint if exists custom_order_requests_name_length;
alter table public.custom_order_requests add constraint custom_order_requests_name_length check (char_length(name) between 2 and 160);
alter table public.custom_order_requests drop constraint if exists custom_order_requests_email_length;
alter table public.custom_order_requests add constraint custom_order_requests_email_length check (char_length(email) between 3 and 320);
alter table public.custom_order_requests drop constraint if exists custom_order_requests_budget_nonnegative;
alter table public.custom_order_requests add constraint custom_order_requests_budget_nonnegative check (budget is null or budget >= 0);

-- Bespoke reference artwork is private by design. The application API uses the service role
-- only after verifying the authenticated customer or authorized staff role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('custom-order-requests', 'custom-order-requests', false, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=false, file_size_limit=8388608, allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'];

-- Do not grant browser clients direct object access. All reads/uploads go through server routes.
