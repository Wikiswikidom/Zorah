# In-App Notifications

Authenticated users receive relevant account/order/custom-order updates in a notification center.

Each notification has recipient, event type, title, body, read state, created timestamp and optional resource reference.

Customers can mark notifications read; they cannot edit notification content. Admin notifications may include operational actions but must still respect RBAC.

Realtime delivery is optional. Polling or refresh-based updates are acceptable if they reduce complexity without hurting UX.