# RBAC

Initial roles:

- Super Admin — all approved administrative capabilities.
- Catalog Admin — products, categories, collections and inventory.
- Order Admin — orders, payments and fulfilment.
- Content Admin — homepage and editorial CMS.
- Marketing Admin — promotions and merchandising.
- Support Admin — customers, enquiries and custom orders.
- Analytics Admin — reports and analytics.

Permissions are granular; roles are bundles of permissions. Super Admin should inherit all permissions but dangerous actions may still require confirmation or step-up authentication.

Role assignments are auditable and must not be editable by ordinary staff.