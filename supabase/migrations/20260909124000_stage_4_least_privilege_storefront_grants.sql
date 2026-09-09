revoke all on table public.products, public.product_variants, public.product_images, public.categories, public.collections, public.collection_products, public.customer_cart, public.customer_wishlists, public.customer_recently_viewed, public.customer_addresses, public.orders, public.order_items, public.payments, public.inventory_movements from anon;

grant select on table public.products, public.product_variants, public.product_images, public.categories, public.collections, public.collection_products to anon;
