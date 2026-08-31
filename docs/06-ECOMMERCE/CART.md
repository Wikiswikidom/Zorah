# Cart

Cart supports adding/removing variants, quantity changes, stock-aware validation and price display. Guest cart may use secure client state, but checkout must revalidate everything server-side.

Cart should persist appropriately across sessions for signed-in customers without storing sensitive payment information.

When a product becomes unavailable or changes price, show a clear reconciliation state rather than silently charging an outdated value.

Do not treat the cart as an inventory reservation unless a separate reservation mechanism is explicitly implemented.