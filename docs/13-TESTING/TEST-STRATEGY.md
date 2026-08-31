# Test Strategy

Testing layers: unit tests for pure business logic; integration tests for database/server services; component/accessibility tests for critical UI; E2E tests for complete customer/admin journeys.

Critical flows: authentication, product purchase, payment verification, order state transitions, inventory, custom orders and admin permissions.

Tests must include success, validation failure, unauthorized access, concurrency/retry behavior and provider failure where practical.

No production launch without passing critical-path tests.