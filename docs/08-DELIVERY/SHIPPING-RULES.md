# Shipping Rules

Delivery rules should support geographic zones, price, eligibility, estimated timeframe and active/inactive status.

Example model: Lagos zones with configured prices; other states with configured prices; exceptional destinations can be disabled.

Rules are business data, not hard-coded UI constants. Admin changes require permission and audit logging.

The system should show delivery cost before payment and preserve the applied rule/version on the order.