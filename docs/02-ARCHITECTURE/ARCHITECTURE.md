# Architecture

The system is a modular ecommerce platform with a public storefront, authenticated customer area and protected admin area.

Browser → Next.js application → server-side application logic → Supabase/Postgres and Storage. Payment requests pass through trusted server-side code to Paystack. Provider webhooks return to a protected server endpoint, where signatures, amounts and event state are verified before business effects occur.

The public UI should favor server-rendered content where practical. Client components are reserved for interactive experiences such as filters, cart controls and configurators.

Security boundaries: public reads are restricted by database policies; customer operations are scoped to the authenticated user; admin operations require both application authorization and database policies. Secrets exist only in server environments.