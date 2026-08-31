# Orders

Order statuses should be a controlled state machine, for example: pending_payment, paid, confirmed, processing, shipped, delivered, cancelled, refunded.

Orders contain customer snapshot information, delivery snapshot, item snapshots, totals, payment state and timestamps. Historical records must not change because a product was later edited.

Admin transitions require permission and should generate audit records and appropriate notifications.

Customer order history exposes only the signed-in customer's orders.