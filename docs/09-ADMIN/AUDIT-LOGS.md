# Audit Logs

Audit logs record security and business-sensitive actions such as role changes, product publication, price changes, inventory adjustments, order state changes, refunds, CMS publication and administrative authentication events where available.

Each event should include actor, action, resource type/id, timestamp and safe metadata. Never store passwords, secret keys or full payment credentials.

Audit records should be append-oriented and accessible only to authorized roles. Retention requirements must be decided before production.