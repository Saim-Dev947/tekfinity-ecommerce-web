-- ============================================================
-- Tekfinity Store — Demo seed data
-- Safe to run after 0001_init.sql. Uses fixed IDs matching the
-- built-in demo catalog so local mode and Supabase stay in sync.
-- ============================================================

-- ---------- Categories ----------
insert into public.categories (id, name, slug, description, image, sort_order) values
  ('cat-smart-watches', 'Smart Watches', 'smart-watches', 'Smartwatches, fitness bands & wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 1),
  ('cat-power-banks', 'Power Banks', 'power-banks', 'Fast-charging power banks & batteries', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80', 2),
  ('cat-airpods', 'AirPods', 'airpods', 'AirPods, Pro, Max & more', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80', 3),
  ('cat-chargers', 'Chargers & Cables', 'chargers', 'USB-C cables, wireless & MagSafe chargers', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', 4),
  ('cat-cases', 'Cases & Covers', 'cases', 'Phone cases, covers & accessories', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80', 5),
  ('cat-straps', 'Straps & Accessories', 'straps', 'Straps, lanyards & carry accessories', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 6),
  ('cat-electronics', 'Electronics', 'electronics', 'Gadgets, hubs & more', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80', 7)
on conflict (id) do update set name = excluded.name, slug = excluded.slug, description = excluded.description, image = excluded.image, sort_order = excluded.sort_order;
delete from public.categories where id = 'cat-phone-covers';

-- ---------- Products ----------
insert into public.products
  (id, slug, name, description, price, compare_at_price, brand, category_id, category_slug, stock, is_featured, is_bestseller, is_new, is_flash_sale, colors, images, specifications, verification_enabled)
values
  ('p1','airpods-pro-2-usb-c','AirPods Pro (2nd Gen) USB-C',
   'Active Noise Cancellation, Adaptive Audio, and USB-C charging case. Up to 30 hours of total battery life with the case.',
   58999, 64999, 'Apple', 'cat-airpods', 'airpods', 14, true, true, true, false,
   array['White'],
   array['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1603351154351-5cfb3d04ef30?w=900&q=80&auto=format&fit=crop'],
   '{"Chip":"H2","Battery":"Up to 30 hrs (with case)","Charging":"USB-C / MagSafe","Water Resistance":"IP54"}', true),
  ('p2','airpods-4-anc','AirPods 4 with Active Noise Cancellation',
   'Open-ear design with Active Noise Cancellation, Personalized Spatial Audio, and H2 chip performance.',
   44999, 49999, 'Apple', 'cat-airpods', 'airpods', 22, true, true, false, false,
   array['White'],
   array['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80&auto=format&fit=crop'],
   '{"Chip":"H2","Battery":"Up to 24 hrs (with case)","Charging":"USB-C","ANC":"Yes"}', true),
  ('p3','airpods-max','AirPods Max',
   'Over-ear headphones with high-fidelity audio, Active Noise Cancellation, and 20 hours of battery life.',
   145000, null, 'Apple', 'cat-airpods', 'airpods', 6, true, false, false, false,
   array['Space Gray','Silver','Sky Blue','Midnight'],
   array['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80&auto=format&fit=crop'],
   '{"Driver":"40mm dynamic","Battery":"Up to 20 hrs","Chip":"H1 x2","Connection":"Bluetooth 5.0"}', true),
  ('p4','airpods-silicone-case-magsafe','AirPods Pro Silicone Case with MagSafe',
   'Soft-touch silicone case with MagSafe magnet alignment, precise cutouts and wireless charging compatible.',
   2499, 3499, 'Tekfinity', 'cat-cases', 'cases', 85, false, true, false, false,
   array['Black','White','Teal','Navy'],
   array['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=900&q=80&auto=format&fit=crop'],
   '{"Material":"Liquid silicone","MagSafe":"Yes","Wireless Charging":"Compatible"}', false),
  ('p5','airpods-leather-case','AirPods Pro Premium Leather Case',
   'Genuine leather case with microfiber lining, magnetic lid closure and metal logo accent.',
   5999, 7999, 'Tekfinity', 'cat-cases', 'cases', 30, false, false, false, false,
   array['Brown','Black'],
   array['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop'],
   '{"Material":"PU leather","Lining":"Microfiber","Closure":"Magnetic"}', false),
  ('p6','usb-c-to-lightning-cable-2m','USB-C to Lightning Cable (2m, MFi)',
   'Braided nylon cable, MFi certified, supports fast charging up to 20W for iPhone and AirPods.',
   1499, 2499, 'Tekfinity', 'cat-chargers', 'chargers', 140, false, true, false, true,
   array['White','Black'],
   array['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=900&q=80&auto=format&fit=crop'],
   '{"Length":"2m","Certification":"MFi","Power":"Up to 20W"}', false),
  ('p7','magsafe-wireless-charger-15w','MagSafe Wireless Charger 15W',
   '15W magnetic wireless charger with anti-slip base, LED indicator and foreign object detection.',
   4999, 6999, 'Tekfinity', 'cat-chargers', 'chargers', 45, false, false, true, true,
   array['White','Black'],
   array['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80&auto=format&fit=crop'],
   '{"Power":"15W","Stand":"No","Input":"USB-C PD"}', false),
  ('p8','airpods-strap-silicone','AirPods Strap — Silicone Anti-Lost',
   'Lightweight silicone strap keeps your AirPods secure. Adjustable, sweat-resistant and pocket-friendly.',
   899, 1299, 'Tekfinity', 'cat-straps', 'straps', 200, false, true, false, false,
   array['Teal','Black','White','Pink'],
   array['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop'],
   '{"Material":"Silicone","Length":"Adjustable"}', false),
  ('p9','iphone-15-pro-max-case-clear','iPhone 15 Pro Max Clear MagSafe Case',
   'Scratch-resistant clear case with MagSafe ring, military-grade drop protection and anti-yellowing coating.',
   3499, 4999, 'Tekfinity', 'cat-cases', 'cases', 60, true, false, true, false,
   array['Clear'],
   array['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=80&auto=format&fit=crop'],
   '{"Compatibility":"iPhone 15 Pro Max","MagSafe":"Yes","Drop Rating":"3m"}', false),
  ('p10','iphone-15-case-leather','iPhone 15 Leather Wallet Case',
   'Genuine leather case with card slots, magnetic closure and raised camera protection.',
   5999, null, 'Tekfinity', 'cat-cases', 'cases', 8, false, false, false, false,
   array['Tan','Black','Navy'],
   array['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=900&q=80&auto=format&fit=crop'],
   '{"Compatibility":"iPhone 15","Cards":"3 cards","Material":"PU leather"}', false),
  ('p11','power-bank-20000mah-usb-c','Power Bank 20000mAh USB-C PD',
   'High-capacity power bank with 22.5W PD fast charging, digital display and dual USB output.',
   7999, 9999, 'Tekfinity', 'cat-power-banks', 'power-banks', 35, false, false, false, true,
   array['Black','White'],
   array['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80&auto=format&fit=crop'],
   '{"Capacity":"20000mAh","Output":"22.5W PD","Ports":"2x USB-A, 1x USB-C"}', false),
  ('p12','airpods-ear-tips-set','AirPods Pro Ear Tips (4 Sizes)',
   'Replacement ear tips in four sizes for optimal fit, comfort and noise isolation.',
   4499, 5499, 'Apple', 'cat-airpods', 'airpods', 55, false, false, false, false,
   array['White'],
   array['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1603351154351-5cfb3d04ef30?w=900&q=80&auto=format&fit=crop'],
   '{"Sizes":"XS/S/M/L","Material":"Silicone"}', false),
  ('p13','smart-watch-series-8-gps','Smart Watch Series 8 GPS 44mm',
   'AMOLED display smartwatch with heart-rate, SpO2, sleep tracking, Bluetooth calling and 10-day battery.',
   18999, 24999, 'Tekfinity', 'cat-smart-watches', 'smart-watches', 18, true, false, true, false,
   array['Black','Silver'],
   array['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&q=80&auto=format&fit=crop'],
   '{"Display":"1.43in AMOLED","Battery":"Up to 10 days","Sensors":"HR, SpO2, Sleep","Calling":"Bluetooth"}', false),
  ('p14','smart-watch-fitness-band-pro','Smart Watch Fitness Band Pro',
   'Slim fitness smartwatch with 100+ sport modes, notifications, weather and music control.',
   7999, 10999, 'Tekfinity', 'cat-smart-watches', 'smart-watches', 32, false, true, false, false,
   array['Black','Teal','White'],
   array['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop'],
   '{"Display":"1.85in TFT","Battery":"Up to 7 days","Sport Modes":"100+","Water Resistance":"5ATM"}', false),
  ('p15','magsafe-power-bank-10000mah','MagSafe Power Bank 10000mAh',
   'Compact magnetic power bank with 15W wireless charging, USB-C PD port and LED charge indicator.',
   5499, 7499, 'Tekfinity', 'cat-power-banks', 'power-banks', 27, false, false, true, false,
   array['White','Black'],
   array['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80&auto=format&fit=crop'],
   '{"Capacity":"10000mAh","Wireless":"15W MagSafe","Wired":"22.5W PD"}', false)
on conflict (id) do update set
  price = excluded.price, compare_at_price = excluded.compare_at_price, stock = excluded.stock,
  category_id = excluded.category_id, category_slug = excluded.category_slug,
  is_featured = excluded.is_featured, is_bestseller = excluded.is_bestseller,
  is_new = excluded.is_new, is_flash_sale = excluded.is_flash_sale;

-- Keep the demo products, but remove these categories from the catalog.
delete from public.categories where slug in ('cases', 'straps', 'electronics');

-- ---------- Coupons ----------
insert into public.coupons (id, code, discount_type, discount_value, min_order_amount, expires_at, usage_limit, used_count, is_active) values
  ('c1','WELCOME10','percent',10,5000,null,null,0,true),
  ('c2','EID20','percent',20,15000,'2026-12-31T23:59:59Z',null,0,true),
  ('c3','FIRSTORDER','fixed',500,3000,null,500,128,true)
on conflict (id) do nothing;

-- ---------- FAQs ----------
insert into public.faqs (id, question, answer, category, sort_order, is_published) values
  ('f1','Are these products original?','We aim to provide authentic products with product verification where supported. Customers can use the product verification system to check registered product codes.','Products',1,true),
  ('f2','How many days does delivery take?','Within 24 hours in Karachi and approximately 2–3 days in other cities, subject to location and courier availability.','Delivery',2,true),
  ('f3','How can I pay?','JazzCash, Easypaisa, Bank Transfer, and Cash on Delivery.','Payments',3,true),
  ('f4','What if I don''t like the product?','You can request a return or exchange within seven days, subject to the return policy.','Returns',4,true),
  ('f5','Is there a warranty?','Six-month checking warranty, subject to the applicable warranty terms.','Warranty',5,true),
  ('f6','How can I track my order?','Enter your Order ID on the Order Tracking page.','Orders',6,true),
  ('f7','How can I cancel my order?','You can request cancellation before the order is shipped through the website or WhatsApp.','Orders',7,true),
  ('f8','Do you offer cash on delivery?','Yes, Cash on Delivery is available across Pakistan. Please keep the exact amount or small change ready for the courier.','Payments',8,true)
on conflict (id) do nothing;

-- ---------- Site settings ----------
insert into public.site_settings (id, store_name, tagline, announcement, whatsapp_number, contact_email, contact_phone, delivery_charge, free_delivery_above, return_days, warranty_text, bank_details, jazzcash_number, easypaisa_number) values (
  'default',
  'Tekfinity',
  'Premium mobile accessories & electronics in Pakistan',
  'Free delivery on orders over Rs. 3,000 — Karachi delivery within 24 hours',
  '923001234567',
  'support@tekfinity.pk',
  '+92 300 1234567',
  250, 3000, 7,
  'Every eligible product carries a 6-month checking warranty.',
  '{"bank_name":"Meezan Bank","account_title":"Tekfinity (Pvt) Ltd","iban":"PK36MEZN0001234567890123","account_number":"0123456789"}',
  '0300-1234567',
  '0301-7654321'
) on conflict (id) do nothing;

-- ---------- Flash sales ----------
insert into public.flash_sales (id, name, ends_at, is_active) values (
  'flash-default', 'Weekend Flash Sale', now() + interval '7 days', true
) on conflict (id) do nothing;
