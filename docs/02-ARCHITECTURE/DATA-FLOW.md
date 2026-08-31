# Data Flow

Catalog: Admin → server authorization → Postgres/Storage → published storefront.

Customer: Browser → authenticated session → server/database policy → user-owned data.

Checkout: Browser cart → server validates current product/stock/prices → Paystack initialization → customer payment → webhook/verification → order state transition → notification.

Custom order: Customer submission → validation/storage → admin queue → review/quote → customer response → accepted request → order creation.

Content: Admin CMS → validation → published content → cached/server-rendered public page.

Every external callback is treated as untrusted input until verified.