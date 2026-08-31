# E2E Testing

Core scenarios:

1. Browse → product → cart → checkout → successful test payment → order.
2. Failed/cancelled payment does not create a falsely paid order.
3. Customer signs up, verifies account and manages address/wishlist.
4. Customer submits custom order and sees status updates.
5. Admin manages product and inventory.
6. Admin processes an order and sends status notifications.
7. Role restrictions prevent unauthorized admin actions.
8. Mobile navigation and purchase journey remain usable.

E2E tests use test credentials/data and never production secrets.