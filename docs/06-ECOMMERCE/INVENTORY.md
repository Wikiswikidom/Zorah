# Inventory

Inventory is variant/SKU based. The system must define available, reserved and fulfilled quantities where reservation is used.

Stock changes require an auditable reason: sale, adjustment, return, damage, restock or correction. Manual adjustments require authorization.

Checkout must avoid overselling through transactional validation/updates. Concurrency behavior must be tested.

Low-stock thresholds can support admin alerts. Inventory must not be changed by client-side code.