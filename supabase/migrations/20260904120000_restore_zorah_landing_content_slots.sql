-- Restore the complete editable Zorah landing structure without overwriting
-- sections the CMS already contains. Missing slots are created as published
-- content so the existing storefront layout remains intact after deployment.
insert into public.landing_sections
  (section_key, section_type, title, body, primary_cta_label, primary_cta_href,
   theme, is_enabled, sort_order, status, published_at)
values
  ('wear-01', 'collections', 'The everyday edit',
   'Bags made to move through work, weekends and everything between.',
   'Shop handbags', '/shop', 'green', true, 60, 'published', now()),
  ('wear-02', 'collections', 'After dark',
   'Strong silhouettes with the ease to carry from day into evening.',
   'Shop the collection', '/shop', 'dark', true, 70, 'published', now()),
  ('wear-03', 'collections', 'Weekend in colour',
   'A little more colour, the same considered Zorah construction.',
   'Shop handbags', '/shop', 'leather', true, 80, 'published', now()),
  ('wear-04', 'collections', 'The signature',
   'Quiet confidence, shaped in leather and finished by hand.',
   'Shop handbags', '/shop', 'ivory', true, 90, 'published', now()),
  ('editorial', 'editorial', 'One bag. Many lives.',
   'Designed to move between the moments that make up your day.',
   null, null, 'light', true, 100, 'published', now()),
  ('editorial-a', 'media', null, null, null, null,
   'dark', true, 110, 'published', now()),
  ('editorial-b', 'media', null, null, null, null,
   'leather', true, 120, 'published', now()),
  ('journal-01', 'journal', 'Inside the rhythm of Lagos.',
   'Stories from the house.', 'View journal', '/journal',
   'green', true, 130, 'published', now()),
  ('journal-02', 'journal', 'What makes a Zorah bag feel different.',
   'A closer look at the craft behind the pieces.', 'View journal', '/journal',
   'dark', true, 140, 'published', now()),
  ('cta', 'custom_order', 'Find the one that feels like you.',
   'Explore the collection and choose a bag made for your everyday.',
   'Shop handbags', '/shop', 'dark', true, 150, 'published', now())
on conflict (section_key) do nothing;
