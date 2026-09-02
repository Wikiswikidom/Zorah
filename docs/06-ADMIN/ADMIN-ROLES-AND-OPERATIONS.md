# Zorah Admin Roles & Operations

## Security model

- `/admin/login` is the dedicated administrator entry point.
- `/login` remains the customer authentication entry point.
- The admin URL is not a security boundary by itself; every admin route is server-side role checked and protected by Supabase RLS.
- There is one Super Admin account. Do not share its password for day-to-day work.
- New staff should create a normal Zorah account first; the Super Admin then assigns the least-privilege role from **Admin → Team & permissions**.
- The system must never promote a public first signup to Super Admin.

## Roles

| Role | Primary responsibility |
|---|---|
| `super_admin` | Full control, team/role management, all CMS, catalogue, campaigns, orders, support and governance |
| `catalog_admin` | Products, pricing, variants, product media, collections and inventory |
| `content_admin` | Landing page sections, editorial/news and approved brand content |
| `marketing_admin` | Campaigns, promotions, flash sales and merchandising |
| `support_admin` | Customer enquiries, contact requests, custom-bag requests and waitlist follow-up |
| `order_admin` | Orders, payment state, fulfilment, refunds and order communications |
| `analytics_admin` | Reporting and business analytics |
| `operations_admin` | General operational work that does not require ownership of another team's restricted area |

## Recommended staffing

1. Super Admin — one trusted company owner/operator.
2. CMS Admin — landing page and journal.
3. Product Admin — catalogue, prices, stock and product media.
4. Customer Care — contact, custom-order enquiries and waitlists.
5. Order Admin — order/fulfilment operations.
6. Marketing Admin — promotions and merchandising.
7. General Operations — cross-functional operational support.

A person can be assigned only one role in the current RBAC model. If the business later needs multi-role users, introduce an explicit permissions join table rather than making the Super Admin credential shareable.

## Customer-care workflows

The database now has protected intake tables for website contact requests, custom-order requests and product waitlists. Customers can submit requests; only the appropriate staff role can read/update the operational queue.

## Revenue and orders

The executive dashboard intentionally does not display fabricated revenue. Verified revenue should be calculated from persisted orders and server-side Paystack verification once checkout/order persistence is connected.
